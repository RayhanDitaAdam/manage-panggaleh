import express from 'express';
import si from 'systeminformation';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [cpu, mem, fsSize, time, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.currentLoad() // load average
    ]);

    const diskInfo = fsSize.length > 0 ? fsSize[0] : null;

    res.json({
      cpu: cpu.currentLoad,
      ram: {
        total: mem.total,
        used: mem.active,
        free: mem.available,
        percent: (mem.active / mem.total) * 100
      },
      disk: diskInfo ? {
        total: diskInfo.size,
        used: diskInfo.used,
        percent: diskInfo.use
      } : { total: 0, used: 0, percent: 0 },
      uptime: time.uptime,
      loadAverage: [load.avgLoad, load.currentLoadSystem, load.currentLoadUser] // mapping closest metrics
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving status', error: error.message });
  }
});

export default router;
