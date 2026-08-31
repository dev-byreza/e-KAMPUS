import express from 'express';
import cors from 'cors';
import { db } from './db/database';
import { studentsRouter } from './routes/students';
import { offeringsRouter } from './routes/offerings';
import { practiceVersionsRouter } from './routes/practiceVersions';
import { gradesRouter } from './routes/grades';
import { snapshotsRouter } from './routes/snapshots';
import { auditRouter } from './routes/audit';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
    studentsCount: db.students.length,
    offeringsCount: db.offerings.length,
    versionsCount: db.practiceVersions.length,
  });
});

// Mount Routes
app.use('/api/students', studentsRouter);
app.use('/api/offerings', offeringsRouter);
app.use('/api/practice-versions', practiceVersionsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/audit', auditRouter);

// System Reset Route
app.post('/api/system/reset-db', (req, res) => {
  db.resetDatabase();
  res.json({ success: true, message: 'Database telah direset ke kondisi awal Lampiran A.' });
});

// Central Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  });
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 CAD 1.1 REST API Backend Server Running!`);
  console.log(`📍 Endpoint: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
