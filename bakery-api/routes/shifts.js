const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Get current employee's shifts
router.get('/my-shifts', auth, async (req, res) => {
  try {
    const [shifts] = await pool.query(`
      SELECT * FROM Employee_Shift 
      WHERE Employee_ID = ?
      ORDER BY Shift_Date DESC, Shift_Begin DESC
      LIMIT 30
    `, [req.employee.id]);

    res.json(shifts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Manager: Get all active shifts
router.get('/active', auth, authorize(['owner', 'manager']), async (req, res) => {
  try {
    const [shifts] = await pool.query(`
      SELECT es.*, 
        CONCAT(e.First_Name, ' ', e.Last_Name) AS employee_name
      FROM Employee_Shift es
      JOIN Employee e ON es.Employee_ID = e.Employee_ID
      WHERE es.Shift_End IS NULL
      ORDER BY es.Shift_Begin ASC
    `);

    res.json(shifts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;