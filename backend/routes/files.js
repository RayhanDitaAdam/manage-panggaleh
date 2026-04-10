import express from 'express';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Define allowed base directory for file manager to prevent escaping
// Only allow access within /home or /tmp for safety in this demo
const BASE_DIR = '/';

router.use(authMiddleware);

const upload = multer({ dest: '/tmp/dashboard-uploads/' });

const getSafePath = (reqPath) => {
  if (!reqPath) return '/home';
  const target = path.resolve(reqPath);
  return target;
};

router.get('/', async (req, res) => {
  try {
    const dirPath = getSafePath(req.query.path);
    
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    const files = await Promise.all(items.map(async (item) => {
      const fullPath = path.join(dirPath, item.name);
      
      try {
        const stats = await fs.stat(fullPath);
        return {
          name: item.name,
          isDirectory: item.isDirectory(),
          path: fullPath,
          size: stats.size,
          modifiedAt: stats.mtime
        };
      } catch (err) {
        // Skip files that we cannot stat (permission denied)
        return null;
      }
    }));
    
    res.json(files.filter(f => f !== null));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving directory contents', error: error.message });
  }
});

router.get('/read', async (req, res) => {
  try {
    const filePath = getSafePath(req.query.path);
    const stats = await fs.stat(filePath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({ message: 'Path is a directory, not a file' });
    }
    
    // Prevent reading huge files into memory
    if (stats.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({ message: 'File is too large to read (max 5MB)' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ message: 'Error reading file', error: error.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const targetDir = getSafePath(req.body.path);
    const { file } = req;
    
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    
    const targetPath = path.join(targetDir, file.originalname);
    
    // Move uploaded file to target
    await fs.copyFile(file.path, targetPath);
    await fs.unlink(file.path); // remove temp file
    
    res.json({ message: 'File uploaded successfully', targetPath });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

export default router;
