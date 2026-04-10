import express from 'express';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authMiddleware } from '../middleware/auth.js';

const execAsync = promisify(exec);
const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const processes = await si.processes();
    res.json({
      all: processes.all,
      running: processes.running,
      blocked: processes.blocked,
      sleeping: processes.sleeping,
      unknown: processes.unknown,
      list: processes.list.slice(0, 50) // Return top 50 processes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving processes', error: error.message });
  }
});

router.post('/kill', async (req, res) => {
  const { pid } = req.body;
  if (!pid) return res.status(400).json({ message: 'PID is required' });

  try {
    // Note: requires appropriate permissions
    await execAsync(`kill -9 ${pid}`);
    res.json({ message: `Process ${pid} killed successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error killing process', error: error.message });
  }
});

router.get('/top', async (req, res) => {
  try {
    const processes = await si.processes();
    // Sort by CPU percent and get top 10
    const top = processes.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 10);
    res.json(top);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving top processes', error: error.message });
  }
});

export default router;
