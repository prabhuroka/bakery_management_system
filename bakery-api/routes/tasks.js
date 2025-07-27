const cron = require('node-cron');
const { pool } = require('./config/database');
const { NotificationServer } = require('./websocket');

// Daily inventory check (runs at 8 AM)
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily inventory check...');
  try {
    const [lowStockItems] = await pool.query(`
      SELECT 
        i.Ingredient_ID,
        i.Name,
        i.Stock_Level,
        i.Minimum_Level
      FROM Ingredient i
      WHERE i.Stock_Level < i.Minimum_Level
    `);

    if (lowStockItems.length > 0) {
      const message = {
        type: 'daily_inventory_alert',
        items: lowStockItems,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to managers/owners
      NotificationServer.broadcastToRoles(['manager', 'owner'], message);
      
      // Log in database
      await pool.query(
        `INSERT INTO Notification 
         (Type, Message, Created_At)
         VALUES ('inventory', ?, NOW())`,
        [`Daily low stock alert: ${lowStockItems.length} items below minimum`]
      );
    }
  } catch (err) {
    console.error('Inventory check error:', err);
  }
});

// End-of-day sales summary (runs at 11 PM)
cron.schedule('0 23 * * *', async () => {
  console.log('Running end-of-day sales summary...');
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) AS total_orders,
        SUM(Total_Amount) AS total_sales,
        SUM(CASE WHEN Payment_Method = 'cash' THEN Total_Amount ELSE 0 END) AS cash_sales,
        SUM(CASE WHEN Payment_Method = 'credit' THEN Total_Amount ELSE 0 END) AS credit_sales
      FROM \`Order\`
      WHERE DATE(Order_Date) = ?
    `, [today]);

    await pool.query(
      `INSERT INTO Daily_Summary 
       (Summary_Date, Total_Orders, Total_Sales, Cash_Sales, Credit_Sales)
       VALUES (?, ?, ?, ?, ?)`,
      [today, summary[0].total_orders, summary[0].total_sales, 
       summary[0].cash_sales, summary[0].credit_sales]
    );
  } catch (err) {
    console.error('End-of-day summary error:', err);
  }
});

module.exports = cron;