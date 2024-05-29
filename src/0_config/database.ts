import { PoolConfig } from 'pg';
require('dotenv').config();

const config: PoolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
};

export default config;
