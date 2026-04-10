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
    const services = await si.services('*');
    res.json(services);
  } catch (error) {
    // si.services might fail on some platforms without specific configuration
    try {
      const { stdout } = await execAsync('systemctl list-units --type=service --all --no-pager');
      // Simple parse of systemctl output
      const list = stdout.split('\n').filter(l => l.includes('.service')).map(l => {
        const parts = l.trim().split(/\s+/);
        return { name: parts[0], load: parts[1], active: parts[2], sub: parts[3], description: parts.slice(4).join(' ') };
      });
      res.json(list.slice(0, 50));
    } catch (fallbackError) {
      res.status(500).json({ message: 'Error retrieving services', error: fallbackError.message });
    }
  }
});

// Helper to run systemctl commands
const runSystemctl = async (action, service) => {
  return await execAsync(`sudo systemctl ${action} ${service}`); 
};

router.post('/start', async (req, res) => {
  const { service } = req.body;
  try {
    await runSystemctl('start', service);
    res.json({ message: `Service ${service} started` });
  } catch (error) {
    res.status(500).json({ message: 'Error starting service', error: error.message });
  }
});

router.post('/stop', async (req, res) => {
  const { service } = req.body;
  try {
    await runSystemctl('stop', service);
    res.json({ message: `Service ${service} stopped` });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping service', error: error.message });
  }
});

router.post('/restart', async (req, res) => {
  const { service } = req.body;
  try {
    await runSystemctl('restart', service);
    res.json({ message: `Service ${service} restarted` });
  } catch (error) {
    res.status(500).json({ message: 'Error restarting service', error: error.message });
  }
});

router.get('/status', async (req, res) => {
  const { service } = req.query;
  try {
    const services = await si.services(service);
    res.json(services.length ? services[0] : { name: service, status: 'unknown' });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving service status', error: error.message });
  }
});

export default router;
