/**
 * Express app scaffold:
 * - Security middlewares (helmet, hpp, cors)
 * - Static serving for frontend
 * - Compression + basic logging
 * - Health route + central error handler
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env.js';
import { securityHeaders } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';

loadEnv();

const app = express();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy if behind reverse proxy
app.set('trust proxy', 1);

// Logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security + body parsing
app.use(helmet());
app.use(securityHeaders());
app.use(hpp());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Compression
app.use(compression());

// Basic rate limiter for public endpoints (more granular later)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// API routes mount point
app.use('/api', routes);

// Health check (fast, unauthenticated)
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'PartyPilot', time: new Date().toISOString() });
});

// 404 for API (frontend 404 handled by static pages)
app.use('/api', notFound);

// Central error handler
app.use(errorHandler);

export default app;
