const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { pool } = require('./config/database');

class NotificationServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map<WebSocket, employeeId>
    
    this.setupConnectionHandlers();
    this.setupPingInterval();
  }

  setupConnectionHandlers() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Extract token from query string
        const token = new URL(req.url, `ws://${req.headers.host}`).searchParams.get('token');
        
        if (!token) {
          return ws.close(1008, 'Authentication token required');
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const employeeId = decoded.employee.id;

        // Store connection
        this.clients.set(ws, employeeId);

        // Send initial connection message
        ws.send(JSON.stringify({
          type: 'connection',
          status: 'authenticated',
          timestamp: new Date().toISOString()
        }));

        // Setup handlers
        ws.on('close', () => this.handleClose(ws));
        ws.on('error', (err) => this.handleError(ws, err));
        
      } catch (err) {
        console.error('WebSocket connection error:', err.message);
        ws.close(1008, err.message.includes('jwt') ? 'Invalid token' : 'Connection failed');
      }
    });
  }

  setupPingInterval() {
    setInterval(() => {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 30000); // 30 seconds
  }

  handleClose(ws) {
    this.clients.delete(ws);
  }

  handleError(ws, err) {
    console.error('WebSocket error:', err);
    ws.close();
    this.clients.delete(ws);
  }

  async broadcastToRoles(roles, message) {
    try {
      // Get employee IDs with specified roles
      const [employees] = await pool.query(
        `SELECT e.Employee_ID 
         FROM Employee e
         JOIN Employee_Role er ON e.Employee_ID = er.Employee_ID
         JOIN Role r ON er.Role_ID = r.Role_ID
         WHERE r.Role_Name IN (?)`,
        [roles]
      );

      const targetIds = employees.map(e => e.Employee_ID);
      this.broadcastToEmployees(targetIds, message);
    } catch (err) {
      console.error('Error broadcasting to roles:', err);
    }
  }

  broadcastToEmployees(employeeIds, data) {
    const message = JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    });

    this.clients.forEach((employeeId, ws) => {
      if (employeeIds.includes(employeeId)) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        } catch (err) {
          console.error('Failed to send WS message:', err);
        }
      }
    });
  }
}

module.exports = NotificationServer;