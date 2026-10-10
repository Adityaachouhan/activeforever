import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { seedInitialData } from './seed.js';

dotenv.config();

const { Pool, types } = pg;

// Parse PostgreSQL DATE (OID 1082) as plain 'YYYY-MM-DD' string instead of Javascript Date
types.setTypeParser(1082, (val: string) => val);

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'TEST1234',
  database: process.env.DB_NAME || 'avtiveforever',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log('Connecting to PostgreSQL database:', process.env.DB_NAME || 'avtiveforever');
  const client = await pool.connect();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await client.query(schemaSql);
    console.log('Database tables verified / created successfully.');

    await seedInitialData(pool);
  } catch (err) {
    console.error('Error initializing database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}
