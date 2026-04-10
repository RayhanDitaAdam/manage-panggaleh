import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';

const execAsync = promisify(exec);
const router = express.Router();

router.use(authMiddleware);

// Endpoint to fetch real logs using journalctl as an example
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  // Filters could be comma separated e.g., 'error,warn'
  const filtersStr = req.query.filters || '';
  const filters = filtersStr.split(',').filter(f => f);
  
  try {
    // Basic example: get latest syslog or journalctl
    // We'll use journalctl because it's standard on modern linux
    // Command gets the last N lines, reverse order
    let cmd = `journalctl -n ${limit} --no-pager -r`;
    
    // Add filtering based on priority if provided 
    // Usually 'error' -> -p err, 'warn' -> -p warning, 'info' -> -p info
    if (filters.includes('error')) {
      cmd += ` -p err`;
    } else if (filters.includes('warn')) {
      cmd += ` -p warning..err`;
    }
    
    const { stdout } = await execAsync(cmd);
    
    // Parse output
    const logs = stdout.split('\n').filter(l => l.trim().length > 0).map(line => {
      // Very basic parsing
      let level = 'info';
      if (line.toLowerCase().includes('error')) level = 'error';
      else if (line.toLowerCase().includes('warn')) level = 'warn';
      
      return {
        timestamp: new Date().toISOString(), // we'd parse real time in production
        level,
        message: line
      };
    });
    
    res.json(logs);
  } catch (error) {
    // Fallback if journalctl isn't available
    res.json([{ timestamp: new Date().toISOString(), level: 'error', message: 'Could not read journalctl logs: ' + error.message }]);
  }
});

export default router;
