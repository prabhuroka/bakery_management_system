const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT al.*, e.First_Name, e.Last_Name
      FROM Audit_Log al
      JOIN Employee e ON al.Employee_ID = e.Employee_ID
      ORDER BY al.Created_At DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;