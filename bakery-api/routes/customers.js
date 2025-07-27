const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');


// Search customers (staff/owner)
router.get('/search', auth, authorize(['employee', 'manager', 'owner']), async (req, res) => {
  try {
    const { query } = req.query;
    
    const [customers] = await pool.query(
      `SELECT * FROM Customer 
       WHERE First_Name LIKE ? OR Last_Name LIKE ? OR Email LIKE ? OR Phone LIKE ?
       LIMIT 10`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    res.json(customers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create new customer (staff/owner)
router.post('/', auth, authorize(['employee', 'manager', 'owner']), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, loyaltyPoints = 0 } = req.body;
    
    const [result] = await pool.query(
      `INSERT INTO Customer 
       (First_Name, Last_Name, Email, Phone, Loyalty_Points) 
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, loyaltyPoints]
    );

    res.status(201).json({
      customerId: result.insertId,
      message: 'Customer created successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



// Update loyalty points (owner/manager)
router.put('/:id/loyalty', auth, authorize(['manager', 'owner']), async (req, res) => {
  try {
    const { points } = req.body;
    
    await pool.query(
      `UPDATE Customer SET Loyalty_Points = ? WHERE Customer_ID = ?`,
      [points, req.params.id]
    );

    res.json({ message: 'Loyalty points updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;