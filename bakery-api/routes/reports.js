const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const ExcelJS = require('exceljs');

// Dynamic sales report (owner only)
router.get('/sales', auth, authorize('owner'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    let dateFormat, groupByClause;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00:00';
        groupByClause = 'DATE_FORMAT(Order_Date, "%Y-%m-%d %H:00:00")';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupByClause = 'DATE(Order_Date)';
        break;
      case 'week':
        dateFormat = '%Y-%u';
        groupByClause = 'YEARWEEK(Order_Date)';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupByClause = 'DATE_FORMAT(Order_Date, "%Y-%m")';
        break;
      case 'year':
        dateFormat = '%Y';
        groupByClause = 'YEAR(Order_Date)';
        break;
      default:
        return res.status(400).json({ error: 'Invalid groupBy parameter' });
    }

    const [report] = await pool.query(`
      SELECT 
        ${groupByClause} as period,
        COUNT(*) as order_count,
        SUM(Total_Amount) as total_sales,
        SUM(CASE WHEN Payment_Method = 'cash' THEN Total_Amount ELSE 0 END) as cash_sales,
        SUM(CASE WHEN Payment_Method = 'credit' THEN Total_Amount ELSE 0 END) as credit_sales,
        COUNT(DISTINCT Customer_ID) as unique_customers,
        COUNT(DISTINCT Employee_ID) as employees_worked
      FROM \`Order\`
      WHERE Order_Date BETWEEN ? AND ?
        AND Status = 'completed'
      GROUP BY period
      ORDER BY period ASC
    `, [startDate, endDate]);

    // Excel export option
    if (req.query.format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      
      // Add headers
      worksheet.columns = [
        { header: 'Period', key: 'period' },
        { header: 'Orders', key: 'order_count' },
        { header: 'Total Sales', key: 'total_sales' },
        { header: 'Cash Sales', key: 'cash_sales' },
        { header: 'Credit Sales', key: 'credit_sales' },
        { header: 'Unique Customers', key: 'unique_customers' },
        { header: 'Employees Worked', key: 'employees_worked' }
      ];
      
      // Add data
      worksheet.addRows(report);
      
      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=sales-report-${startDate}-to-${endDate}.xlsx`
      );
      
      // Send the workbook
      await workbook.xlsx.write(res);
      return res.end();
    }

    res.json(report);
  } catch (err) {
    console.error('Sales report error:', err);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Cancelled orders report (owner only)
router.get('/cancelled-orders', auth, authorize('owner'), async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    
    let query = `
      SELECT 
        o.Order_ID,
        o.Order_Date,
        o.Total_Amount,
        o.Payment_Method,
        CONCAT(e.First_Name, ' ', e.Last_Name) as employee_name,
        c.Customer_ID,
        CONCAT(c.First_Name, ' ', c.Last_Name) as customer_name,
        COUNT(po.Product_ID) as items_count
      FROM \`Order\` o
      JOIN Employee e ON o.Employee_ID = e.Employee_ID
      JOIN Product_Order po ON o.Order_ID = po.Order_ID
      LEFT JOIN Customer c ON o.Customer_ID = c.Customer_ID
      WHERE o.Status = 'cancelled'
    `;
    
    const params = [];
    
    if (startDate && endDate) {
      query += ' AND o.Order_Date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    if (customerId) {
      query += ' AND o.Customer_ID = ?';
      params.push(customerId);
    }
    
    query += ' GROUP BY o.Order_ID ORDER BY o.Order_Date DESC';
    
    const [report] = await pool.query(query, params);

    res.json(report);
  } catch (err) {
    console.error('Cancelled orders report error:', err);
    res.status(500).json({ error: 'Failed to generate cancelled orders report' });
  }
});

module.exports = router;