import express from 'express';
import cors from 'cors';
import routes from './routes';
import { config } from './config/env';

const app = express();

app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RevenueAI Backend Engine',
    timestamp: new Date().toISOString(),
  });
});

// Master API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    errorCode: 'NOT_FOUND',
  });
});

// Centralized Error Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    errorCode: 'SERVER_ERROR',
  });
});

export default app;
