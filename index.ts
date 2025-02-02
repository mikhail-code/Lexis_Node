import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import usersRoutes from './src/0_routes/users';
import dictionaryRoutes from "./src/0_routes/dictionaries";
import translationRoutes from './src/0_routes/translation';

import sequelize from './src/0_config/database';

const app: express.Application = express();
const port = 3000;

require('dotenv').config();

const useMockService = process.env.TO_MOCK === 'true'; // We need this to excape problems with .env values are string by default

app.use(bodyParser.json()); 
app.use(cors());

// mounting routes
app.use('/users', usersRoutes(useMockService));
app.use("/dictionaries", dictionaryRoutes);
app.use('/translation', translationRoutes);

// Route for handling GET requests to the root path (/)
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World from TypeScript!');
});

// Start the server and listen on the defined port
sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized successfully.');
    // Start your server or application logic here
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database synchronization error:', error);
  });


module.exports = app;

import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

/**
 * New Code
 */
// import authRoutes from './src/0_routes/auth';
// import usersRoutes from './src/0_routes/users';

// app.use('/auth', authRoutes);
// app.use('/users', usersRoutes);