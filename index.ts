import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import usersRoutes from './src/0_routes/users';
import dictionaryRoutes from "./src/0_routes/dictionaries";

const app: express.Application = express(); // Type annotation for Express app
const port = 3000;

require('dotenv').config();

const useMockService = process.env.TO_MOCK === 'true'; // We need this to excape problems with .env values are string by default

app.use(bodyParser.json()); // Add bodyParser middleware
app.use(cors()); // Add CORS middleware

// ... mount routes
app.use('/users', usersRoutes(useMockService));
app.use("/dictionaries", dictionaryRoutes);

// Route for handling GET requests to the root path (/)
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World from TypeScript!');
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
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