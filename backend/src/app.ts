import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.route';
import itemRouter from './routes/item.route';

const app: Application = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 Fullstack API is running!',
    endpoints: {
      health: '/api/health',
      items: '/api/items',
    },
    docs: 'Check /api/health for database status',
  });
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/items', itemRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
