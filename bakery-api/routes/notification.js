const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Get all active alerts
router.get('/', auth, async (req, res) => {
  try {
    // Low inventory alerts
    const [ingredients] = await pool.query(`
      SELECT 
        i.*,
        (i.Minimum_Level - i.Stock_Level) as shortage_amount
      FROM Ingredient i
      WHERE i.Stock_Level < i.Minimum_Level
      ORDER BY shortage_amount DESC
    `);
    
    // Low product stock alerts
    const [products] = await pool.query(`
      SELECT 
        p.Product_ID,
        p.Product_Name,
        p.Product_Stock_Level
      FROM Product p
      WHERE p.Product_Stock_Level < 5 AND p.Active = 1
      ORDER BY p.Product_Stock_Level ASC
    `);

    // Expiring ingredients (within 7 days)
    const [expiring] = await pool.query(`
      SELECT 
        i.Ingredient_ID,
        i.Name,
        i.Stock_Level,
        DATEDIFF(i.Expiry_Date, CURDATE()) as days_until_expiry
      FROM Ingredient i
      WHERE i.Expiry_Date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      ORDER BY i.Expiry_Date ASC
    `);

    res.json({
      ingredients,
      products,
      expiring,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Mark notification as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO Notification_Read (Employee_ID, Notification_ID, Read_Date)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE Read_Date = NOW()`,
      [req.employee.id, req.params.id]
    );
    
    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;