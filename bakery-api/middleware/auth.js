const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Main authentication middleware
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh employee data from DB
    const [employees] = await pool.query(
      `SELECT e.*, GROUP_CONCAT(r.Role_Name) as roles 
       FROM Employee e
       JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
       JOIN Role r ON er.Role_ID = r.Role_ID
       WHERE e.Employee_ID = ? GROUP BY e.Employee_ID`, 
      [decoded.employee.id]
    );

    if (employees.length === 0) {
      return res.status(401).json({ msg: 'Employee not found' });
    }

    req.employee = {
      id: employees[0].Employee_ID,
      roles: employees[0].roles.split(',').map(role => role.trim())
           // Converts "owner,manager" to ["owner", "manager"]
    };
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Role authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.some(role => req.employee.roles.includes(role))) {
      return res.status(403).json({ msg: 'Unauthorized - Insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, authorize };