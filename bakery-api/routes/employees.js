const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Get all employees (owner/manager only)
router.get('/', auth, authorize(['owner', 'manager']), async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT 
        e.*,
        GROUP_CONCAT(DISTINCT r.Role_Name) as roles
      FROM Employee e
      LEFT JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
      LEFT JOIN Role r ON er.Role_ID = r.Role_ID
      GROUP BY e.Employee_ID
      ORDER BY e.Last_Name, e.First_Name
    `);

    // Convert roles string to array
    const employeesWithRolesArray = employees.map(emp => ({
      ...emp,
      roles: emp.roles ? emp.roles.split(',') : []
    }));

    res.json(employeesWithRolesArray);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get employee details
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  const { First_Name, Last_Name, Active, roles, New_Password } = req.body;
  
  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Update basic employee info
      await conn.query(
        `UPDATE Employee 
         SET First_Name = ?, Last_Name = ?, Active = ?
         WHERE Employee_ID = ?`,
        [First_Name, Last_Name, Active, req.params.id]
      );

      // Update password if provided
      if (New_Password) {
        const hashedPassword = await bcrypt.hash(New_Password, 10);
        await conn.query(
          `UPDATE Employee 
           SET Password = ?
           WHERE Employee_ID = ?`,
          [hashedPassword, req.params.id]
        );
      }

      // Update roles (filter out owner role)
      const validRoles = (roles || []).filter(role => role !== 'owner');
      const finalRoles = Array.from(new Set(['employee', ...validRoles]));

      // Clear existing roles
      await conn.query(
        `DELETE FROM Employee_Role WHERE Employee_ID = ?`,
        [req.params.id]
      );

      // Add new roles
      for (const role of finalRoles) {
        const [roleData] = await conn.query(
          `SELECT Role_ID FROM Role WHERE Role_Name = ?`,
          [role]
        );

        if (roleData.length > 0) {
          await conn.query(
            `INSERT INTO Employee_Role (Employee_ID, Role_ID)
             VALUES (?, ?)`,
            [req.params.id, roleData[0].Role_ID]
          );
        }
      }

      await conn.commit();

      // Get updated employee data
      const [employee] = await conn.query(
        `SELECT e.*, GROUP_CONCAT(r.Role_Name) as roles
         FROM Employee e
         JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
         JOIN Role r ON er.Role_ID = r.Role_ID
         WHERE e.Employee_ID = ?
         GROUP BY e.Employee_ID`,
        [req.params.id]
      );

      res.json(employee[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Employee update error:', err);
    res.status(500).json({ 
      error: 'Failed to update employee',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update employee roles (owner only)
router.put('/:id/roles', auth, authorize('owner'), async (req, res) => {
  try {
    const { roles } = req.body;
    
    if (!Array.isArray(roles)) {
      return res.status(400).json({ msg: 'Roles must be an array' });
    }

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Remove all existing roles
      await conn.query(
        `DELETE FROM Employee_Role WHERE Employee_ID = ?`,
        [req.params.id]
      );

      // Add new roles
      for (const role of roles) {
        const [roleData] = await conn.query(
          `SELECT Role_ID FROM Role WHERE Role_Name = ?`,
          [role]
        );

        if (roleData.length === 0) {
          throw new Error(`Invalid role: ${role}`);
        }

        await conn.query(
          `INSERT INTO Employee_Role (Employee_ID, Role_ID)
           VALUES (?, ?)`,
          [req.params.id, roleData[0].Role_ID]
        );
      }

      await conn.commit();
      conn.release();

      res.json({ msg: 'Roles updated successfully' });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Employee clock in/out
router.post('/:id/shifts', auth, async (req, res) => {
  try {
    const { action } = req.body;
    const employeeId = req.params.id;

    // Employees can only clock themselves in/out
    if (req.employee.id !== parseInt(employeeId)) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    if (action === 'clock-in') {
      const [result] = await pool.query(`
        INSERT INTO Employee_Shift 
        (Employee_ID, Shift_Date, Shift_Begin) 
        VALUES (?, CURDATE(), NOW())
      `, [employeeId]);

      res.json({ 
        shift_id: result.insertId,
        message: 'Clocked in successfully'
      });
    } else if (action === 'clock-out') {
      const [activeShift] = await pool.query(`
        SELECT Shift_ID FROM Employee_Shift 
        WHERE Employee_ID = ? AND Shift_End IS NULL
        ORDER BY Shift_Begin DESC LIMIT 1
      `, [employeeId]);

      if (activeShift.length === 0) {
        return res.status(400).json({ msg: 'No active shift found' });
      }

      await pool.query(`
        UPDATE Employee_Shift 
        SET Shift_End = NOW() 
        WHERE Shift_ID = ?
      `, [activeShift[0].Shift_ID]);

      res.json({ message: 'Clocked out successfully' });
    } else {
      res.status(400).json({ msg: 'Invalid action' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.put('/:id/status', auth, authorize('owner'), async (req, res) => {
  const { active } = req.body;
  
  try {
    const [result] = await pool.query(
      `UPDATE Employee SET Active = ? WHERE Employee_ID = ?`,
      [active, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee status updated' });
  } catch (err) {
    console.error('Employee status update error:', err);
    res.status(500).json({ error: 'Failed to update employee status' });
  }
});

//Add new employee (owner only)
router.post('/', auth, authorize('owner'), async (req, res) => {
  const { First_Name, Last_Name, Email, Password, Phone, roles = ['employee'] } = req.body;
  
  if (!First_Name || !Last_Name || !Email || !Password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Create employee
      const [result] = await conn.query(
        `INSERT INTO Employee 
         (First_Name, Last_Name, Email, Password, Phone, Hire_Date, Active)
         VALUES (?, ?, ?, ?, ?, CURDATE(), TRUE)`,
        [First_Name, Last_Name, Email, hashedPassword, Phone]
      );

      const employeeId = result.insertId;

      // Assign roles (filter out owner role just in case)
      const validRoles = roles.filter(role => role !== 'owner');
      
      // If no valid roles provided, default to employee
      const rolesToAssign = validRoles.length > 0 ? validRoles : ['employee'];
      
      for (const role of rolesToAssign) {
        const [roleData] = await conn.query(
          `SELECT Role_ID FROM Role WHERE Role_Name = ?`,
          [role]
        );

        if (roleData.length > 0) {
          await conn.query(
            `INSERT INTO Employee_Role (Employee_ID, Role_ID)
             VALUES (?, ?)`,
            [employeeId, roleData[0].Role_ID]
          );
        }
      }

      await conn.commit();
      
      // Get the created employee with roles
      const [employee] = await conn.query(
        `SELECT e.*, GROUP_CONCAT(r.Role_Name) as roles
         FROM Employee e
         JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
         JOIN Role r ON er.Role_ID = r.Role_ID
         WHERE e.Employee_ID = ?
         GROUP BY e.Employee_ID`,
        [employeeId]
      );

      res.status(201).json(employee[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Employee creation error:', err);
    res.status(500).json({ 
      error: 'Failed to create employee',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});



module.exports = router;