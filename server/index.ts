import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool, initDatabase } from './db.js';
import { verifyFirebaseIdToken } from './firebase-admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built frontend assets
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Whitelist allowed tables to prevent arbitrary table access
const ALLOWED_TABLES = new Set([
  'profiles',
  'users',
  'events',
  'event_categories',
  'registrations',
  'banners',
  'gallery_albums',
  'gallery_media',
  'event_media',
  'event_stories',
  'winners_stories',
  'race_categories',
  'testimonials'
]);

const DATE_COLUMNS = new Set(['date', 'end_date', 'reg_open_date', 'reg_close_date', 'dob']);
const UUID_COLUMNS = new Set(['id', 'event_id', 'category_id', 'user_id', 'album_id']);
const DECIMAL_COLUMNS = new Set(['distance_km']);
const INT_COLUMNS = new Set([
  'price_inr',
  'virtual_price_inr',
  'max_participants',
  'sort_order',
  'amount_paid',
  'year',
  'rating'
]);

function sanitizeValue(col: string, val: any): any {
  if (val === undefined) return undefined;
  if (val === 'null' || val === null) return null;
  if (val === 'true') return true;
  if (val === 'false') return false;

  // Empty strings in DATE or UUID columns must be NULL in PostgreSQL
  if (val === '') {
    if (DATE_COLUMNS.has(col) || UUID_COLUMNS.has(col)) {
      return null;
    }
    if (INT_COLUMNS.has(col)) {
      return 0;
    }
  }

  // Integer conversion
  if (INT_COLUMNS.has(col) && typeof val === 'string' && /^-?\d+$/.test(val.trim())) {
    return parseInt(val.trim(), 10);
  }

  if (DECIMAL_COLUMNS.has(col) && typeof val === 'string' && /^-?(?:\d+\.?\d*|\.\d+)$/.test(val.trim())) {
    return Number(val.trim());
  }

  // Objects and arrays for JSON/JSONB columns (e.g. fees_table, subpages)
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    return JSON.stringify(val);
  }

  return val;
}

// Admin Credentials (hardcoded — change here to update)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

// Admin Login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  try {
    // Fetch or create admin profile in DB
    let profileResult = await pool.query(
      `SELECT * FROM "profiles" WHERE "role" = 'admin' LIMIT 1`
    );

    let adminProfile = profileResult.rows[0];

    if (!adminProfile) {
      // Create admin profile if it doesn't exist
      const newId = (await pool.query('SELECT gen_random_uuid() AS id')).rows[0].id;
      const insertResult = await pool.query(
        `INSERT INTO "profiles" (id, name, role) VALUES ($1, $2, $3) RETURNING *`,
        [newId, 'Admin', 'admin']
      );
      adminProfile = insertResult.rows[0];
    }

    return res.json({
      success: true,
      profile: adminProfile,
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Firebase Phone OTP Verification & PostgreSQL Session Completion
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  const { idToken, name } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: { message: 'Missing Firebase idToken in request.' } });
  }

  try {
    // 1. Verify the Firebase ID Token using firebase-admin
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const fullPhone = decodedToken.phone_number || '';

    if (!fullPhone) {
      return res.status(400).json({
        error: { message: 'The verified token does not contain a phone number.' }
      });
    }

    // Normalize phone number to 10 digits for Indian numbers (e.g. +919876543210 -> 9876543210)
    const normalizedMobile = fullPhone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

    // 2. Query PostgreSQL to check if user exists in the profiles/users table
    const existingResult = await pool.query(
      `SELECT * FROM "profiles" WHERE "mobile" = $1 OR "mobile" = $2 LIMIT 1`,
      [normalizedMobile, fullPhone]
    );

    let userProfile = existingResult.rows[0];

    if (userProfile) {
      // User exists. Update name if user provided a name and existing name is blank or default
      const trimmedName = typeof name === 'string' ? name.trim() : '';
      if (trimmedName && (!userProfile.name || userProfile.name.startsWith('Runner '))) {
        const updateResult = await pool.query(
          `UPDATE "profiles" SET "name" = $1 WHERE "id" = $2 RETURNING *`,
          [trimmedName, userProfile.id]
        );
        userProfile = updateResult.rows[0];
      }
    } else {
      // 3. Register new user in PostgreSQL
      const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : `Runner ${normalizedMobile.slice(-4)}`;
      const userEmail = decodedToken.email || `${normalizedMobile}@activeforever.in`;
      const role = normalizedMobile === '9999999999' ? 'admin' : 'user';

      const insertResult = await pool.query(
        `INSERT INTO "profiles" (id, name, mobile, email, role)
         VALUES (gen_random_uuid(), $1, $2, $3, $4)
         RETURNING *`,
        [trimmedName, normalizedMobile, userEmail, role]
      );
      userProfile = insertResult.rows[0];
    }

    // 4. Complete session payload
    const sessionUser = {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      mobile: userProfile.mobile,
      role: userProfile.role,
    };

    const session = {
      user: sessionUser,
      access_token: idToken,
      firebase_uid: firebaseUid,
    };

    return res.json({
      success: true,
      user: userProfile,
      session,
      isNewUser: !existingResult.rows[0],
    });
  } catch (err: any) {
    console.error('Error in /api/auth/verify-otp:', err);
    return res.status(401).json({
      error: {
        message: err.message || 'Firebase token verification failed.',
        code: err.code || 'AUTH_VERIFICATION_FAILED',
      },
    });
  }
});

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Dynamic Query / Table API (serves all frontend data hooks)
app.get('/api/db/:table', async (req: Request, res: Response) => {
  const rawTable = req.params.table;
  const table = Array.isArray(rawTable) ? rawTable[0] : rawTable;
  if (!table || !ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const targetTable = table === 'users' ? 'profiles' : table;

  try {
    const select = (req.query.select as string) || '*';
    const isHead = req.query.head === 'true';
    const isExactCount = req.query.count === 'exact';
    const isSingle = req.query.single === 'true';
    const orderParam = req.query.order as string;
    const limitParam = req.query.limit as string;
    
    // Filters: filter=col:op:val or repeated filter
    const filterParams = req.query.filter;
    const filters: { col: string; op: string; val: any }[] = [];

    if (filterParams) {
      const rawFilters = Array.isArray(filterParams) ? filterParams : [filterParams];
      for (const f of rawFilters) {
        if (typeof f === 'string') {
          const parts = f.split(':');
          if (parts.length >= 3) {
            filters.push({
              col: parts[0],
              op: parts[1],
              val: parts.slice(2).join(':'),
            });
          }
        }
      }
    }

    // IN filters: in=col:val1,val2
    const inParams = req.query.in;
    const inFilters: { col: string; vals: string[] }[] = [];
    if (inParams) {
      const rawIns = Array.isArray(inParams) ? inParams : [inParams];
      for (const item of rawIns) {
        if (typeof item === 'string') {
          const [col, valList] = item.split(':');
          if (col && valList) {
            inFilters.push({ col, vals: valList.split(',') });
          }
        }
      }
    }

    const whereClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const f of filters) {
      // Validate column name (only alphanumeric and underscore)
      if (!/^[a-zA-Z0-9_]+$/.test(f.col)) continue;

      const val = sanitizeValue(f.col, f.val);

      if (f.op === 'eq') {
        if (val === null) {
          whereClauses.push(`"${f.col}" IS NULL`);
        } else {
          whereClauses.push(`"${f.col}" = $${paramIndex++}`);
          values.push(val);
        }
      } else if (f.op === 'neq') {
        if (val === null) {
          whereClauses.push(`"${f.col}" IS NOT NULL`);
        } else {
          whereClauses.push(`"${f.col}" != $${paramIndex++}`);
          values.push(val);
        }
      }
    }

    for (const inf of inFilters) {
      if (!/^[a-zA-Z0-9_]+$/.test(inf.col)) continue;
      whereClauses.push(`"${inf.col}" = ANY($${paramIndex++})`);
      values.push(inf.vals);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // If head request (count only)
    if (isHead) {
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM "${targetTable}" ${whereSQL}`,
        values
      );
      return res.json({ data: null, count: countRes.rows[0].count, error: null });
    }

    // Build SELECT query
    let orderSQL = '';
    if (orderParam) {
      const [col, dir] = orderParam.split(':');
      if (/^[a-zA-Z0-9_]+$/.test(col)) {
        orderSQL = `ORDER BY "${col}" ${dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
      }
    }

    let limitSQL = '';
    if (limitParam && !isNaN(parseInt(limitParam, 10))) {
      limitSQL = `LIMIT ${parseInt(limitParam, 10)}`;
    }

    // Columns
    const selectCols = select === '*' ? '*' : select.split(',').map(c => `"${c.trim()}"`).join(', ');

    const sql = `SELECT ${selectCols} FROM "${targetTable}" ${whereSQL} ${orderSQL} ${limitSQL}`;
    const result = await pool.query(sql, values);

    let count: number | null = null;
    if (isExactCount) {
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS count FROM "${targetTable}" ${whereSQL}`,
        values
      );
      count = countRes.rows[0].count;
    }

    if (isSingle) {
      const singleData = result.rows.length > 0 ? result.rows[0] : null;
      return res.json({ data: singleData, count, error: null });
    }

    return res.json({ data: result.rows, count, error: null });
  } catch (err: any) {
    console.error(`Error querying table ${table}:`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Insert into table (with automatic upsert support if ID is provided)
app.post('/api/db/:table', async (req: Request, res: Response) => {
  const rawTable = req.params.table;
  const table = Array.isArray(rawTable) ? rawTable[0] : rawTable;
  if (!table || !ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const targetTable = table === 'users' ? 'profiles' : table;

  try {
    const payload = req.body;
    const isArray = Array.isArray(payload);
    const rowsToInsert = isArray ? payload : [payload];

    if (rowsToInsert.length === 0) {
      return res.json({ data: [], error: null });
    }

    const insertedRows: any[] = [];

    for (const row of rowsToInsert) {
      // Exclude empty/null id so PostgreSQL auto-generates with DEFAULT gen_random_uuid()
      const keys = Object.keys(row).filter(k => {
        if (!/^[a-zA-Z0-9_]+$/.test(k)) return false;
        if (row[k] === undefined) return false;
        if (k === 'id' && (row[k] === '' || row[k] === null)) return false;
        return true;
      });
      if (keys.length === 0) continue;

      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const vals = keys.map(k => sanitizeValue(k, row[k]));

      let sql: string;
      if (keys.includes('id')) {
        const updateCols = keys.filter(k => k !== 'id');
        if (updateCols.length > 0) {
          const updateSet = updateCols.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
          sql = `INSERT INTO "${targetTable}" (${cols}) VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updateSet} RETURNING *`;
        } else {
          sql = `INSERT INTO "${targetTable}" (${cols}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING RETURNING *`;
        }
      } else {
        sql = `INSERT INTO "${targetTable}" (${cols}) VALUES (${placeholders}) RETURNING *`;
      }

      const result = await pool.query(sql, vals);
      if (result.rows.length > 0) {
        insertedRows.push(result.rows[0]);
      } else {
        const existing = await pool.query(`SELECT * FROM "${targetTable}" WHERE "id" = $1`, [row.id]);
        if (existing.rows.length > 0) insertedRows.push(existing.rows[0]);
      }
    }

    return res.json({ data: isArray ? insertedRows : insertedRows[0] || null, error: null });
  } catch (err: any) {
    console.error(`Error inserting into ${table}:`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Update rows in table
app.patch('/api/db/:table', async (req: Request, res: Response) => {
  const rawTable = req.params.table;
  const table = Array.isArray(rawTable) ? rawTable[0] : rawTable;
  if (!table || !ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const targetTable = table === 'users' ? 'profiles' : table;

  try {
    const payload = req.body;
    const filterParam = req.query.filter as string;
    if (!filterParam) {
      return res.status(400).json({ error: 'Filter required for updates' });
    }

    const parts = filterParam.split(':');
    const col = parts[0];
    const op = parts[1];
    const rawVal = parts.slice(2).join(':');

    if (!/^[a-zA-Z0-9_]+$/.test(col) || op !== 'eq') {
      return res.status(400).json({ error: 'Unsupported filter for update' });
    }

    const filterVal = sanitizeValue(col, rawVal);

    const keys = Object.keys(payload).filter(k => payload[k] !== undefined && /^[a-zA-Z0-9_]+$/.test(k) && k !== 'id');
    if (keys.length === 0) {
      return res.json({ data: null, error: null });
    }

    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = keys.map(k => sanitizeValue(k, payload[k]));
    values.push(filterVal);

    const sql = `UPDATE "${targetTable}" SET ${setClauses} WHERE "${col}" = $${values.length} RETURNING *`;
    const result = await pool.query(sql, values);

    return res.json({ data: result.rows, error: null });
  } catch (err: any) {
    console.error(`Error updating table ${table}:`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// Delete from table
app.delete('/api/db/:table', async (req: Request, res: Response) => {
  const rawTable = req.params.table;
  const table = Array.isArray(rawTable) ? rawTable[0] : rawTable;
  if (!table || !ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: `Invalid table: ${table}` });
  }
  const targetTable = table === 'users' ? 'profiles' : table;

  try {
    const filterParam = req.query.filter as string;
    if (!filterParam) {
      return res.status(400).json({ error: 'Filter required for deletion' });
    }

    const parts = filterParam.split(':');
    const col = parts[0];
    const op = parts[1];
    const rawVal = parts.slice(2).join(':');

    if (!/^[a-zA-Z0-9_]+$/.test(col) || op !== 'eq') {
      return res.status(400).json({ error: 'Unsupported filter for deletion' });
    }

    const filterVal = sanitizeValue(col, rawVal);
    const sql = `DELETE FROM "${targetTable}" WHERE "${col}" = $1 RETURNING *`;
    const result = await pool.query(sql, [filterVal]);

    return res.json({ data: result.rows, error: null });
  } catch (err: any) {
    console.error(`Error deleting from table ${table}:`, err);
    return res.status(500).json({ data: null, error: { message: err.message } });
  }
});

// SPA fallback: all non-API GET requests serve dist/index.html
if (fs.existsSync(distPath)) {
  app.use((req: Request, res: Response, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Express server and connect to PostgreSQL
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Active Forever PostgreSQL API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
