import app from './app';
import { connectDatabase } from './config/db';
import { ENV } from './config/env';

const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  const server = app.listen(ENV.PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Server running in ${ENV.NODE_ENV} mode`);
    console.log(`📡 URL: http://localhost:${ENV.PORT}`);
    console.log(`🩺 Health: http://localhost:${ENV.PORT}/api/health`);
    console.log(`📦 Items API: http://localhost:${ENV.PORT}/api/items`);
    console.log(`===============================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
