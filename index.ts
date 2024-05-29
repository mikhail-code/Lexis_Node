import express from 'express';
import bodyParser from 'body-parser';

import usersRoutes from './src/0_routes/users';

const app: express.Application = express(); // Type annotation for Express app
const port = 3000;

require('dotenv').config();

const useMockService = process.env.TO_MOCK === 'true'; // We need this to excape problems with .env values are string by default

app.use(bodyParser.json()); // Add bodyParser middleware

// ... mount routes
app.use('/users', usersRoutes(useMockService));

// Route for handling GET requests to the root path (/)
app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World from TypeScript!');
});

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});

module.exports = app;
