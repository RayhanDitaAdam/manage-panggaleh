import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authMiddleware } from '../middleware/auth.js';

const execAsync = promisify(exec);
const router = express.Router();

router.use(authMiddleware);

router.post('/restart', async (req, res) => {
  try {
    // Important: requires sudoers configuration to allow restart without password
    res.json({ message: 'Server restart initiated...' });
    // In a real app we delay and then restart
    setTimeout(() => {
      execAsync('sudo reboot');
    }, 1000);
  } catch (error) {
    res.status(500).json({ message: 'Error initiating restart', error: error.message });
  }
});

router.post('/shutdown', async (req, res) => {
  try {
    res.json({ message: 'Server shutdown initiated...' });
    setTimeout(() => {
      execAsync('sudo shutdown now');
    }, 1000);
  } catch (error) {
    res.status(500).json({ message: 'Error initiating shutdown', error: error.message });
  }
});

export default router;
