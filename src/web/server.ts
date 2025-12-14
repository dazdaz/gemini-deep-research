/**
 * Web Server
 * Express server for the Gemini Deep Research Agent web interface
 */

import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { apiRouter } from './routes/api.js';

// Load environment variables
config();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Trust proxy for secure cookies behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for development
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path, stat) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
}));

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    },
  });
});

// Start server
app.listen(Number(PORT), HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  const innerWidth = 64;
  const lineContent = `   Server running at: ${url}`;
  const padding = ' '.repeat(Math.max(0, innerWidth - lineContent.length));
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔬 Gemini Deep Research Agent                                ║
║                                                                ║
║${lineContent}${padding}║
║                                                                ║
║   API Endpoints:                                               ║
║   • POST /api/research     - Start new research                ║
║   • GET  /api/research/:id - Get research status               ║
║   • POST /api/upload       - Upload files                      ║
║   • GET  /api/sessions     - List sessions                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    console.warn('\n⚠️  Warning: GEMINI_API_KEY environment variable is not set.');
    console.warn('   Set it with: export GEMINI_API_KEY=your-api-key');
    console.warn('   Get your API key at: https://aistudio.google.com/apikey\n');
  }
});

export default app;
