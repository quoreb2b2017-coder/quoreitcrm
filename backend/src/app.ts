import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / curl (no origin header)
      if (!origin) return cb(null, true);
      if (config.frontend.origins.includes(origin)) return cb(null, origin);
      cb(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(config.apiPrefix, routes);

app.use(errorHandler);

export default app;
