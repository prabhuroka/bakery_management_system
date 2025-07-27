const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Create new order with enhanced validation
router.post('/', auth, authorize(['employee', 'owner']), async (req, res) => {
  const { customer_id, products, payment_method, notes, discount = 0 } = req.body;
  
  if (!['cash', 'credit'].includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'No products in order' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const product of products) {
      const [result] = await conn.query(
        `UPDATE Product 
         SET Product_Stock_Level = Product_Stock_Level - ?
         WHERE Product_ID = ? AND Product_Stock_Level >= ?`,
        [product.quantity, product.product_id, product.quantity]
      );

      if (result.affectedRows === 0) {
        throw { 
          code: 'INSUFFICIENT_STOCK',
          product_id: product.product_id
        };
      }
    }

    // Calculate total amount first
    let totalAmount = 0;
    for (const product of products) {
      const [productData] = await conn.query(
        `SELECT Price, Product_Stock_Level FROM Product 
         WHERE Product_ID = ? AND Active = 1 FOR UPDATE`,
        [product.product_id]
      );

      if (productData.length === 0) {
        throw { 
          code: 'PRODUCT_NOT_FOUND',
          product_id: product.product_id 
        };
      }

      if (productData[0].Product_Stock_Level < product.quantity) {
        throw { 
          code: 'INSUFFICIENT_STOCK',
          product_id: product.product_id,
          available: productData[0].Product_Stock_Level,
          requested: product.quantity
        };
      }

      totalAmount += productData[0].Price * product.quantity;
    }

    // Apply discount
    totalAmount -= parseFloat(discount) || 0;

    // Create order (matches your table structure)
    const [orderResult] = await conn.query(
      `INSERT INTO \`Order\` 
       (Employee_ID, Customer_ID, Order_Date, Discount, Payment_Method, Total_Amount, Notes, Status)
       VALUES (?, ?, NOW(), ?, ?, ?, ?, 'pending')`,
      [
        req.employee.id,
        customer_id || null,
        discount || 0,
        payment_method,
        totalAmount,
        notes || null
      ]
    );

    const orderId = orderResult.insertId;

    // Process products - modified to match your Product_Order table structure
    for (const product of products) {
      await conn.query(
        `INSERT INTO Product_Order 
         (Product_ID, Order_ID, Quantity)
         VALUES (?, ?, ?)`,
        [product.product_id, orderId, product.quantity]
      );
    }

    // Record payment
    await conn.query(
      `INSERT INTO Payment 
       (Order_ID, Amount, Payment_Method, Payment_Date, Employee_ID)
       VALUES (?, ?, ?, NOW(), ?)`,
      [orderId, totalAmount, payment_method, req.employee.id]
    );

    await conn.commit();

    res.status(201).json({
      order_id: orderId,
      total_amount: totalAmount,
      status: 'completed',
      payment_method,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    await conn.rollback();
    
    if (err.code === 'PRODUCT_NOT_FOUND') {
      return res.status(400).json({
        error: 'Product not found or inactive',
        product_id: err.product_id
      });
    }
    
    if (err.code === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        error: 'Insufficient stock',
        product_id: err.product_id,
        available: err.available,
        requested: err.requested
      });
    }

    console.error('Order processing error:', err);
    res.status(500).json({ 
      error: 'Failed to process order',
      details: process.env.NODE_ENV === 'development' ? err : undefined
    });
  } finally {
    conn.release();
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const [order] = await pool.query(`
      SELECT 
        o.*,
        CONCAT(e.First_Name, ' ', e.Last_Name) AS employee_name,
        c.First_Name AS customer_first_name,
        c.Last_Name AS customer_last_name
      FROM \`Order\` o
      JOIN Employee e ON o.Employee_ID = e.Employee_ID
      LEFT JOIN Customer c ON o.Customer_ID = c.Customer_ID
      WHERE o.Order_ID = ?
    `, [req.params.id]);

    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [products] = await pool.query(`
      SELECT 
        p.Product_ID, p.Product_Name, p.Price, p.Image_URL,
        po.Quantity, (po.Quantity * p.Price) AS item_total
      FROM Product_Order po
      JOIN Product p ON po.Product_ID = p.Product_ID
      WHERE po.Order_ID = ?
    `, [req.params.id]);

    const [payments] = await pool.query(`
      SELECT * FROM Payment WHERE Order_ID = ?
    `, [req.params.id]);

    res.json({
      ...order[0],
      products,
      payments
    });

  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get orders by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const validStatuses = ['pending', 'completed', 'cancelled'];
    const status = req.params.status;
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [orders] = await pool.query(`
      SELECT 
        o.*,
        CONCAT(e.First_Name, ' ', e.Last_Name) AS employee_name,
        c.First_Name AS customer_first_name,
        c.Last_Name AS customer_last_name
      FROM \`Order\` o
      JOIN Employee e ON o.Employee_ID = e.Employee_ID
      LEFT JOIN Customer c ON o.Customer_ID = c.Customer_ID
      WHERE o.Status = ?
      ORDER BY o.Order_Date DESC
    `, [status]);

    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/:id/status', auth, authorize(['employee', 'owner']), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get current order status and products
    const [order] = await conn.query(
      `SELECT Status FROM \`Order\` WHERE Order_ID = ? FOR UPDATE`,
      [req.params.id]
    );

    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentStatus = order[0].Status;
    const [products] = await conn.query(
      `SELECT Product_ID, Quantity FROM Product_Order WHERE Order_ID = ?`,
      [req.params.id]
    );

    // 2. Handle stock adjustments based on status changes
    if (status === 'cancelled' && currentStatus !== 'cancelled') {
      // Increase stock when cancelling an order
      for (const product of products) {
        await conn.query(
          `UPDATE Product 
           SET Product_Stock_Level = Product_Stock_Level + ?
           WHERE Product_ID = ?`,
          [product.Quantity, product.Product_ID]
        );
      }
    }
    // No stock change when completing an order (already decreased when created)

    // 3. Update order status
    await conn.query(
      `UPDATE \`Order\` SET Status = ? WHERE Order_ID = ?`,
      [status, req.params.id]
    );

    await conn.commit();
    res.json({ message: 'Order status updated' });

  } catch (err) {
    await conn.rollback();
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    conn.release();
  }
});

module.exports = router;