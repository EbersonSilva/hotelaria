import { Pool } from 'pg';

// const connectionString = process.env.DATABASE_URL;
const connectionString = "postgres://postgres:557836@localhost:5432/hotelaria";

if (!connectionString) {
  throw new Error('DATABASE_URL não configurado. O backend precisa de Postgres para persistir os dados.');
}

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export default pool;
