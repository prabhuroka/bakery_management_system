const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Employee Login
router.post('/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get employee from database with roles
    const [employees] = await pool.query(
      `SELECT e.*, GROUP_CONCAT(r.Role_Name) as roles 
       FROM Employee e
       JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
       JOIN Role r ON er.Role_ID = r.Role_ID
       WHERE e.Email = ? AND e.Active = 1
       GROUP BY e.Employee_ID`, 
      [email]
    );
    

    if (employees.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const employee = employees[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, employee.Password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload with roles
    const payload = {
      employee: {
        id: employee.Employee_ID,
        name: `${employee.First_Name} ${employee.Last_Name}`,
        // Ensure roles is always an array
        roles: employee.roles.split(',').map(role => role.trim())
      }
    };


    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: employee.Employee_ID,
            name: `${employee.First_Name} ${employee.Last_Name}`,
            roles: employee.roles.split(',').map(role => role.trim()), // Array format
            email: employee.Email
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
router.get('/debug/secret', (req, res) => {
  res.json({
    secret: process.env.JWT_SECRET,
    correct: process.env.JWT_SECRET === 'your_secure_jwt_secret'
  });
});

// Owner/Manager Login (if separate)
router.post('/admin/login', async (req, res) => {
  // Similar to employee login but with role verification
});

module.exports = router;