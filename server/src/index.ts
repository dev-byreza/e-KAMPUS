import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getStudents, getOfferings, getPracticeVersions, resetDatabase } from './db/database';
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

// Root API index
app.get('/api', (req, res) => {
  res.json({
    name: 'e-KAMPUS CAD 1.1 API',
    version: '1.1.0',
    database: 'supabase-postgresql + drizzle-orm',
    endpoints: [
      'GET  /api/health',
      'GET  /api/students',
      'POST /api/students',
      'POST /api/students/bulk-import',
      'DELETE /api/students/:id',
      'GET  /api/offerings',
      'GET  /api/offerings/:id',
      'PUT  /api/offerings/:id',
      'POST /api/offerings/:id/verify-roster',
      'POST /api/offerings/:id/verify-dates',
      'GET  /api/practice-versions',
      'GET  /api/practice-versions/:id',
      'POST /api/practice-versions',
      'PUT  /api/practice-versions/:id',
      'POST /api/practice-versions/:id/publish',
      'POST /api/practice-versions/:id/apply',
      'GET  /api/grades/:offeringId',
      'POST /api/grades/exercise',
      'POST /api/grades/pdf',
      'POST /api/grades/softskill',
      'POST /api/grades/attendance',
      'POST /api/grades/attendance/bulk-present',
      'GET  /api/snapshots/:offeringId',
      'POST /api/snapshots/finalize',
      'POST /api/snapshots/reopen',
      'GET  /api/audit',
      'POST /api/audit',
      'POST /api/system/reset-db',
    ],
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [students, offerings, versions] = await Promise.all([
      getStudents(),
      getOfferings(),
      getPracticeVersions(),
    ]);
    res.json({
      status: 'ok',
      version: '1.1.0',
      database: 'supabase-postgresql',
      timestamp: new Date().toISOString(),
      studentsCount: students.length,
      offeringsCount: offerings.length,
      versionsCount: versions.length,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Mount Routes
app.use('/api/students', studentsRouter);
app.use('/api/offerings', offeringsRouter);
app.use('/api/practice-versions', practiceVersionsRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/audit', auditRouter);

// System Reset
app.post('/api/system/reset-db', async (req, res) => {
  try {
    await resetDatabase();
    res.json({ success: true, message: 'Database telah direset ke kondisi awal.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Central Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: err.message || 'Terjadi kesalahan internal.' });
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 CAD 1.1 REST API  ·  Drizzle + Supabase`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
