require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Test DB Connection
testConnection().then(isConnected => {
  if (!isConnected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
});


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notification'));
// app.use('/api/website', require('./routes/website'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/audit-logs', require('./routes/audit'));
app.use('/api/roles', require('./routes/roles'));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


// After all routes
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Custom error types
  if (err.message === 'INSUFFICIENT_STOCK') {
    return res.status(400).json({ 
      error: 'Insufficient Stock',
      details: err.details 
    });
  }

  if (err.message === 'UNAUTHORIZED_ACCESS') {
    return res.status(403).json({ 
      error: 'Unauthorized Access',
      requiredRoles: err.requiredRoles 
    });
  }

  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));




const http = require('http');
const NotificationServer = require('./websocket');

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const notificationServer = new NotificationServer(server);
app.set('notificationServer', notificationServer);

// Modified server startup
