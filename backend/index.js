import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import monitoringRoutes from './routes/monitoring.js';
import processRoutes from './routes/process.js';
import servicesRoutes from './routes/services.js';
import serverControlRoutes from './routes/serverControl.js';
import logsRoutes from './routes/logs.js';
import filesRoutes from './routes/files.js';
import networkRoutes from './routes/network.js';
import systemRoutes from './routes/system.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Configuration matching the prompt
const config = {
  port: process.env.PORT || 5005,
  security: {
    rateLimit: true,
    ipWhitelist: [],
    httpsOnly: false
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
if (config.security.rateLimit) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);
}

// Attach WebSocket Server to req for routes that might need it
app.use((req, res, next) => {
  req.wss = wss;
  next();
});

// Routes
// In a real scenario, you'd add JWT verification middleware to paths other than /auth
app.use('/auth', authRoutes);
app.use('/status', monitoringRoutes);
app.use('/process', processRoutes);
app.use('/services', servicesRoutes);
app.use('/server', serverControlRoutes);
app.use('/logs', logsRoutes);
app.use('/files', filesRoutes);
app.use('/network', networkRoutes);
app.use('/system', systemRoutes);

// Mock WebSocket implementation for Realtime Logs
wss.on('connection', (ws) => {
  console.log('Client connected for realtime logs');
  
  // Example of sending simulated log stream periodically
  const logInterval = setInterval(() => {
    ws.send(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      level: 'info', 
      message: 'System running normally' 
    }));
  }, 5000);

  ws.on('close', () => {
    clearInterval(logInterval);
    console.log('Client disconnected from realtime logs');
  });
});

httpServer.listen(config.port, () => {
  console.log(`Advanced Server Dashboard Backend running on port ${config.port}`);
});
