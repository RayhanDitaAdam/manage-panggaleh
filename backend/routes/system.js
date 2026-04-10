import express from 'express';
import si from 'systeminformation';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const [osInfo, system, cpu] = await Promise.all([
      si.osInfo(),
      si.system(),
      si.cpu()
    ]);
    
    res.json({
      hostname: osInfo.hostname,
      os: osInfo.distro + ' ' + osInfo.release,
      kernel: osInfo.kernel,
      platform: osInfo.platform,
      arch: osInfo.arch,
      model: system.model,
      manufacturer: system.manufacturer,
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving system info', error: error.message });
  }
});

export default router;
