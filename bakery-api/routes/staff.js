const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Utility function (must be defined or imported)
async function createOrder(orderData) {
  // Your order creation logic here
}

// Quick order creation (staff app)
router.post('/quick-order', 
  auth, 
  authorize(['employee', 'manager', 'owner']), 
  async (req, res) => {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order items' });
    }

    try {
      const order = await createOrder({
        employeeId: req.employee.id,
        items,
        paymentMethod: 'cash'
      });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


module.exports = router; 