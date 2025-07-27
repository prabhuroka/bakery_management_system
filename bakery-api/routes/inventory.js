const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Enhanced inventory update with real-time alerts
router.post('/ingredients/:id/update', auth, authorize(['owner', 'manager']), async (req, res) => {
  const { quantity, action, reason } = req.body;
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validate input
    if (!['add', 'subtract'].includes(action)) {
      throw { status: 400, message: 'Invalid action' };
    }

    if (isNaN(quantity)) {
      throw { status: 400, message: 'Quantity must be a number' };
    }

    // 2. Update inventory
    const updateQuery = action === 'add' 
      ? 'UPDATE Ingredient SET Stock_Level = Stock_Level + ? WHERE Ingredient_ID = ?'
      : 'UPDATE Ingredient SET Stock_Level = GREATEST(0, Stock_Level - ?) WHERE Ingredient_ID = ?';

    const [updateResult] = await conn.query(updateQuery, [quantity, id]);

    if (updateResult.affectedRows === 0) {
      throw { status: 404, message: 'Ingredient not found' };
    }

    // 3. Log adjustment
    await conn.query(
      `INSERT INTO Inventory_Adjustment 
       (Ingredient_ID, Employee_ID, Quantity, Reason, Adjustment_Date)
       VALUES (?, ?, ?, ?, NOW())`,
      [id, req.employee.id, action === 'add' ? quantity : -quantity, reason || 'Manual adjustment']
    );

    // 4. Get updated ingredient data
    const [ingredient] = await conn.query(
      `SELECT 
        i.*,
        (i.Stock_Level < i.Minimum_Level) AS is_low,
        (i.Stock_Level / i.Minimum_Level * 100) AS stock_percentage
       FROM Ingredient i
       WHERE Ingredient_ID = ?`,
      [id]
    );

    // 5. Check for low stock and send alert if needed
    if (ingredient[0].is_low) {
      const alertMessage = {
        type: 'inventory_alert',
        severity: ingredient[0].stock_percentage < 50 ? 'critical' : 'warning',
        message: `Low stock: ${ingredient[0].Name} (${ingredient[0].Stock_Level} remaining)`,
        ingredient: {
          id: ingredient[0].Ingredient_ID,
          name: ingredient[0].Name,
          current: ingredient[0].Stock_Level,
          minimum: ingredient[0].Minimum_Level
        },
        timestamp: new Date().toISOString()
      };

      // Send real-time alert to managers/owners
      req.app.get('notificationServer').broadcastToRoles(
        ['owner', 'manager'],
        alertMessage
      );

      // Also log in database
      await conn.query(
        `INSERT INTO Notification 
         (Type, Message, Related_ID, Created_At)
         VALUES ('inventory', ?, ?, NOW())`,
        [alertMessage.message, id]
      );
    }

    await conn.commit();
    res.json(ingredient[0]);

  } catch (err) {
    await conn.rollback();
    console.error('Inventory update error:', err.message);
    res.status(err.status || 500).json({ 
      error: err.message || 'Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    conn.release();
  }
});

// Get ingredient details
router.get('/ingredients/:id', auth, async (req, res) => {
  try {
    const [ingredient] = await pool.query(
      `SELECT 
        i.*,
        (SELECT COUNT(*) FROM Product_Ingredient WHERE Ingredient_ID = i.Ingredient_ID) AS product_count,
        (SELECT SUM(Quantity) FROM Inventory_Adjustment WHERE Ingredient_ID = i.Ingredient_ID AND Quantity < 0 
         AND Adjustment_Date > DATE_SUB(NOW(), INTERVAL 7 DAY)) AS weekly_usage
      FROM Ingredient i
      WHERE Ingredient_ID = ?`,
      [req.params.id]
    );

    if (ingredient.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient[0]);
  } catch (err) {
    console.error('Ingredient fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all ingredients
router.get('/ingredients', auth, async (req, res) => {
  try {
    const [ingredients] = await pool.query(
      `SELECT 
        i.*,
        (i.Stock_Level < i.Minimum_Level) AS is_low
      FROM Ingredient i
      ORDER BY is_low DESC, Name ASC`
    );

    res.json(ingredients);
  } catch (err) {
    console.error('Ingredients fetch error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;