import express from 'express';
import { exec } from 'child_process';
import util from 'util';

const router = express.Router();
const execAsync = util.promisify(exec);

// Execute PM2 commands using npx to ensure it runs even if only installed locally
const runPM2 = async (command) => {
  try {
    const { stdout, stderr } = await execAsync(`pm2 ${command}`);
    return { success: true, data: stdout };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

router.get('/list', async (req, res) => {
  const result = await runPM2('jlist');
  if (result.success) {
    try {
      const pm2List = JSON.parse(result.data);
      res.json(pm2List);
    } catch(e) {
      res.json([]);
    }
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post('/action', async (req, res) => {
  const { action, target, name, script } = req.body;
  // action: 'restart', 'stop', 'delete', 'start'
  // target: id or 'all'
  // start requires script path
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Requires admin role' });
  }

  let cmd = '';
  if (action === 'start') {
    if (!script) return res.status(400).json({ error: 'Script path required for start' });
    cmd = `start ${script}`;
    if (name) cmd += ` --name "${name}"`;
  } else if (['restart', 'stop', 'delete'].includes(action)) {
    if (target === undefined) return res.status(400).json({ error: 'Target ID required' });
    cmd = `${action} ${target}`;
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  const result = await runPM2(cmd);
  if (result.success) {
    res.json({ message: `PM2 action ${action} executed successfully` });
  } else {
    res.status(500).json({ error: result.error });
  }
});

export default router;
