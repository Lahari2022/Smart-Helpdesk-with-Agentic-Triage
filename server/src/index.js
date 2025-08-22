import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './db.js';
import { PORT } from './config.js';
import authRoutes from './routes/auth.js';
import kbRoutes from './routes/kb.js';
import ticketsRoutes from './routes/tickets.js';
import agentRoutes from './routes/agent.js';
import configRoutes from './routes/config.js';
import auditRoutes from './routes/audit.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/readyz', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api', auditRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
};
start().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});
