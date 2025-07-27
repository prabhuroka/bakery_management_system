const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const auditLog = require('../middleware/audit');


// Update global settings
router.put('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { lowStockThreshold, businessHours, taxRate } = req.body;

    // Validate inputs
    if (lowStockThreshold && isNaN(lowStockThreshold)) {
      return res.status(400).json({ msg: 'Invalid stock threshold' });
    }

    // Update settings in database
    await pool.query(`
      INSERT INTO Settings (Setting_Name, Setting_Value)
      VALUES 
        ('low_stock_threshold', ?),
        ('business_hours', ?),
        ('tax_rate', ?)
      ON DUPLICATE KEY UPDATE Setting_Value = VALUES(Setting_Value)
    `, [lowStockThreshold, JSON.stringify(businessHours), taxRate]);
    await auditLog(req, 'SETTINGS_UPDATE', {
      changedFields: Object.keys(req.body)
    });
    res.json({ msg: 'Settings updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;