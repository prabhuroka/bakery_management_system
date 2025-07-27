const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize(['owner']), async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM Role');
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;