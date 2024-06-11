const Sequelize = require('sequelize');
const isProduction = process.env.NODE_ENV === 'production'; // Assuming 'production' for deployment
require('dotenv').config();

const sequelizeConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  logging: !isProduction, // Avoid excessive logging in production
  define: {
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
};

// Initialize Sequelize instance (without force sync)
const sequelize = new Sequelize(sequelizeConfig);

// **Optional:** Export Sequelize instance for potential future usage
// export default sequelize;

// If FORCE_DB_SCHEMA is set (development only), force schema creation
if (process.env.FORCE_DB_SCHEMA && !isProduction) {
  console.warn('Initializing database schema (development only)');
  sequelize.sync({ force: true })
      .then(() => console.log('Database schema created successfully'))
      .catch((error: any) => console.error('Error creating schema:', error));
}

module.exports = {
  // ... your existing database interaction logic using PoolConfig or other methods
  // You can potentially explore integrating Sequelize gradually if needed
};
