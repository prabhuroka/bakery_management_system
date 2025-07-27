const { pool } = require('../config/database');

const auditLog = async (req, actionType, details = null) => {
  if (!req.employee) return;
  
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {
    await pool.query(
      `INSERT INTO Audit_Log 
       (Employee_ID, Action_Type, Action_Details, IP_Address)
       VALUES (?, ?, ?, ?)`,
      [req.employee.id, actionType, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = auditLog;