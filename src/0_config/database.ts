import { Sequelize } from 'sequelize-typescript';
import User from '../3_models/User'; 
import Auth from '../3_models/Auth'; 
import Dictionary from '../3_models/Dictionary'; 
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

console.log('User:', User);  // ✅ Debug: Ensure User is not undefined
console.log('Auth:', Auth);  // ✅ Debug: Ensure Auth is not undefined
console.log('Dictionary:', Dictionary);  // ✅ Debug: Ensure Dictionary is not undefined


const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  models: [User, Auth, Dictionary], // Register models
  logging: !isProduction,
  define: {
    freezeTableName: true,
    timestamps: true,
  },
});

// Initialize database
const initDatabase = async () => {
  try {
    if (!isProduction) {
      console.warn('Synchronizing database schema (development only).');
      await sequelize.sync({ alter: true });
      console.log('Database schema synchronized successfully.');
    } else {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Initialize the database when this module is imported
initDatabase().catch(console.error);

export default sequelize;
