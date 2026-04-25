import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import escrowRoutes from './routes/escrow.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import helperRoutes from './routes/helper.routes.js';
import fundsRoutes from './routes/funds.routes.js';
import statsRoutes from './routes/stats.routes.js';
import userRoutes from './routes/user.routes.js';
import unitRoutes from './routes/unit.routes.js';
import fuelLogRoutes from './routes/fuelLog.routes.js';
import configRoutes from './routes/config.routes.js';
import stationRoutes from './routes/station.routes.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.cors.origin === '*' ? true : config.cors.origin.split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TANKO-scrow-backend',
    network: config.stellar.network,
  });
});

app.use('/api/v1', escrowRoutes);
app.use('/api/v1', walletRoutes);
app.use('/api/v1', fundsRoutes);
app.use('/api/v1', statsRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', unitRoutes);
app.use('/api/v1', fuelLogRoutes);
app.use('/api/v1', configRoutes);
app.use('/api/v1', stationRoutes);
app.use('/api/v1/helper', helperRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: config.env === 'development' ? err.message : 'Internal server error',
  });
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    TANKO-scrow Backend                    ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     RUNNING                                          ║
║  Port:       ${String(config.port).padEnd(48)}║
║  Network:    ${config.stellar.network.padEnd(48)}║
║  API URL:    ${config.trustlessWork.apiUrl.substring(0, 48).padEnd(48)}║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
