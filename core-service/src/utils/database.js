import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
});

const createTables = async () => {
  // Companies
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(120) UNIQUE NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(64),
      address TEXT,
      city VARCHAR(128),
      postal_code VARCHAR(32),
      country VARCHAR(128) DEFAULT 'Slovakia',
      website TEXT,
      description TEXT,
      logo_url TEXT,
      settings JSONB DEFAULT '{}'::jsonb,
      subscription_plan VARCHAR(64) DEFAULT 'basic',
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name VARCHAR(120),
      last_name VARCHAR(120),
      phone VARCHAR(64),
      company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
      role VARCHAR(64) DEFAULT 'user',
      permissions JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMPTZ,
      reset_token TEXT,
      reset_token_expires TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // User profiles
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      position VARCHAR(120),
      department VARCHAR(120),
      preferences JSONB DEFAULT '{}'::jsonb,
      notifications_settings JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Refresh tokens
  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // API keys
  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      key_hash TEXT NOT NULL,
      permissions JSONB DEFAULT '[]'::jsonb,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      last_used TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    );
  `);

  // Integration logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS integration_logs (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      service VARCHAR(120) NOT NULL,
      action VARCHAR(120) NOT NULL,
      request_data JSONB,
      response_data JSONB,
      status VARCHAR(64) DEFAULT 'success',
      error_message TEXT,
      duration_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Indexes
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies (slug);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_company_id ON users (company_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_company_id ON api_keys (company_id);`);
};

export const connectDB = async () => {
  await pool.query('SELECT 1');
  await createTables();
  console.log('DB ready');
};

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
