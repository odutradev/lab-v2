import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

const getMongoStatusText = (readyState: number): string => {
  switch (readyState) {
    case 0:
      return 'Disconnected';
    case 1:
      return 'Connected';
    case 2:
      return 'Connecting';
    case 3:
      return 'Disconnecting';
    default:
      return 'Unknown';
  }
};

router.get('/', (_req: Request, res: Response) => {
  const readyState = mongoose.connection.readyState;
  const isDbConnected = readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'backend-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      connected: isDbConnected,
      status: getMongoStatusText(readyState),
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
  });
});

export default router;
