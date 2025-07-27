const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Sales analytics (owner only)
router.get('/sales', auth, authorize('owner'), async (req, res) => {
  try {
    const { period = 'daily', limit = 30 } = req.query;
    
    let interval, dateFormat;
    switch (period) {
      case 'hourly': 
        interval = 'HOUR'; 
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'daily': 
        interval = 'DAY'; 
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly': 
        interval = 'WEEK'; 
        dateFormat = '%Y-%u';
        break;
      case 'monthly': 
        interval = 'MONTH'; 
        dateFormat = '%Y-%m';
        break;
      default: 
        interval = 'DAY';
        dateFormat = '%Y-%m-%d';
    }

    const [sales] = await pool.query(`
      SELECT 
        DATE_FORMAT(Order_Date, ?) AS period,
        SUM(Total_Amount) AS total_sales,
        COUNT(*) AS order_count,
        AVG(Total_Amount) AS avg_order_value
      FROM \`Order\`
      WHERE Order_Date >= DATE_SUB(NOW(), INTERVAL ? ${interval})
      GROUP BY period
      ORDER BY period ASC
    `, [dateFormat, limit]);

    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Product performance (owner only)
router.get('/products', auth, authorize('owner'), async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.Product_ID,
        p.Product_Name,
        p.Price,
        COUNT(DISTINCT po.Order_ID) AS order_count,
        SUM(po.Quantity) AS total_quantity,
        SUM(po.Quantity * p.Price) AS revenue,
        AVG(r.Rating) AS avg_rating
      FROM Product p
      LEFT JOIN Product_Order po ON p.Product_ID = po.Product_ID
      LEFT JOIN \`Order\` o ON po.Order_ID = o.Order_ID
      LEFT JOIN Review r ON p.Product_ID = r.Product_ID
      WHERE o.Order_Date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY p.Product_ID
      ORDER BY revenue DESC
    `);

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Inventory turnover (owner only)
router.get('/inventory', auth, authorize('owner'), async (req, res) => {
  try {
    const [turnover] = await pool.query(`
      SELECT 
        i.Ingredient_ID,
        i.Name,
        i.Stock_Level,
        i.Minimum_Level,
        COUNT(DISTINCT po.Order_ID) AS used_in_orders,
        COUNT(DISTINCT ia.Adjustment_ID) AS manual_adjustments,
        SUM(CASE WHEN ia.Quantity > 0 THEN ia.Quantity ELSE 0 END) AS added_stock,
        SUM(CASE WHEN ia.Quantity < 0 THEN ABS(ia.Quantity) ELSE 0 END) AS removed_stock
      FROM Ingredient i
      LEFT JOIN Product_Ingredient pi ON i.Ingredient_ID = pi.Ingredient_ID
      LEFT JOIN Product_Order po ON pi.Product_ID = po.Product_ID
      LEFT JOIN Inventory_Adjustment ia ON i.Ingredient_ID = ia.Ingredient_ID
      WHERE (po.Order_ID IS NOT NULL OR ia.Adjustment_ID IS NOT NULL)
        AND (po.Order_Date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
      GROUP BY i.Ingredient_ID
    `);

    res.json(turnover);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;