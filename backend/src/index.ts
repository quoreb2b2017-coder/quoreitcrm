import { createServer } from 'http';
import { config } from './config/index.js';
import { connectDb } from './config/db.js';
import app from './app.js';
import { attachSocketIo } from './socket.js';

async function main(): Promise<void> {
  await connectDb();

  const httpServer = createServer(app);
  attachSocketIo(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`[Server] API + Socket.io running at http://localhost:${config.port}${config.apiPrefix}`);
    const { cloudName, apiKey, apiSecret } = config.cloudinary;
    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        '[Server] Cloudinary not configured — profile photo & video uploads will return 503. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in apps/backend/.env'
      );
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
