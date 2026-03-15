import https from 'https';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// HTTPS configuration
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, process.env.HTTPS_KEY_PATH || '../certs/server.key')),
  cert: fs.readFileSync(path.resolve(__dirname, process.env.HTTPS_CERT_PATH || '../certs/server.crt')),
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Create HTTPS server
    const server = https.createServer(httpsOptions, app);

    // Socket.io will be initialized here
    // initializeSocket(server);

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on https://localhost:${PORT}`);
      console.log(`📚 API Documentation: https://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: https://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
