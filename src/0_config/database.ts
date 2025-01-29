import { Sequelize } from 'sequelize-typescript';
import { User } from '../3_models/user'; // Import the User model
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432, // Use port from env or default to 5432
  models: [User], // Register the User model
  logging: !isProduction, // Disable logging in production
  define: {
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
    timestamps: true, // Automatically add createdAt and updatedAt
  },
});

// Optional: Force schema sync in non-production environments (use with caution)
if (process.env.FORCE_DB_SCHEMA && !isProduction) {
  console.warn('Forcing database schema synchronization (development only).');
  sequelize.sync({ force: true })
    .then(() => console.log('Database schema synchronized successfully.'))
    .catch((error: any) => console.error('Error synchronizing schema:', error));
}

export default sequelize;