import express from 'express';
import si from 'systeminformation';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/connections', async (req, res) => {
  try {
    const connections = await si.networkConnections();
    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving network connections', error: error.message });
  }
});

router.get('/ports', async (req, res) => {
  try {
    // Si provides network connections, we can filter for LISTENING state 
    // to approximate "open ports"
    const connections = await si.networkConnections();
    const openPorts = connections
      .filter(conn => conn.state === 'LISTEN')
      .map(conn => ({
        protocol: conn.protocol,
        localAddress: conn.localAddress,
        localPort: conn.localPort,
        process: conn.process
      }));
      
    // deduplicate by port if needed
    const uniquePorts = Array.from(new Map(openPorts.map(item => [item.localPort, item])).values());
    res.json(uniquePorts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving open ports', error: error.message });
  }
});

export default router;
