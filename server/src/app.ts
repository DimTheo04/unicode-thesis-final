import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import courseRoutes from './modules/course/course.routes.js';
import enrollmentRoutes from './modules/enrollment/enrollment.routes.js';
import assignmentRoutes from './modules/assignment/assignment.routes.js';
import submissionRoutes from './modules/submission/submission.routes.js';
import { submissionCommentRoutes, commentActionRoutes } from './modules/comment/comment.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import fileRoutes from './modules/files/file.routes.js';
import { globalLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

// Ensure mandatory upload storage directories exist
const assignmentUploads = path.join(process.cwd(), 'uploads/assignments');
const submissionUploads = path.join(process.cwd(), 'uploads/submissions');
if (!fs.existsSync(assignmentUploads)) fs.mkdirSync(assignmentUploads, { recursive: true });
if (!fs.existsSync(submissionUploads)) fs.mkdirSync(submissionUploads, { recursive: true });

const app = express();

// Trust reverse proxy (Railway, Render, Nginx, Cloudflare)
app.set('trust proxy', 1);

// 1. Disable Fingerprinting
app.disable('x-powered-by');

// 2. Apply Helmet Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows resource loading when needed
    contentSecurityPolicy: false // Disable strict CSP at API layer to avoid conflict with API tools
  })
);

// 3. Hardened CORS Configuration
const allowedOrigins = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400 // Cache preflight response for 24 hours
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing application/x-www-form-urlencoded

// Global API rate limiter
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Academic Code Review Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/assignments', assignmentRoutes);
app.use('/api/assignments/:assignmentId/submissions', submissionRoutes);
app.use('/api/submissions/:submissionId/comments', submissionCommentRoutes);
app.use('/api/comments', commentActionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);

// Static frontend assets in production (serves built React SPA if client/dist is present)
const clientDistPath = path.resolve(process.cwd(), 'client/dist');
const altClientDistPath = path.resolve(process.cwd(), '../client/dist');
const finalDistPath = fs.existsSync(clientDistPath) ? clientDistPath : (fs.existsSync(altClientDistPath) ? altClientDistPath : null);

if (finalDistPath) {
  app.use(express.static(finalDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(finalDistPath, 'index.html'));
  });
}

// Centralized Error Handling Middleware (Must be last)
app.use(errorHandler);

export default app;
