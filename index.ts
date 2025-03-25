import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './src/0_routes/auth';
import usersRoutes from './src/0_routes/users';
import dictionaryRoutes from "./src/0_routes/dictionaries";
import translationRoutes from './src/0_routes/translation';

import sequelize from './src/0_config/database';

dotenv.config();

const app: express.Application = express();
const port = 3000;

const useMockService = process.env.TO_MOCK === 'true';

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [];

        if (process.env.NODE_ENV === 'production') {
            // Production: Allow only the specified production origin
            const prodOrigin = process.env.PROD_CORS_ORIGIN;
            if (prodOrigin) {
                allowedOrigins.push(prodOrigin);
            } else {
                console.error("PROD_CORS_ORIGIN environment variable is not set in production!");
                return callback(new Error('CORS error: PROD_CORS_ORIGIN not configured in production.'), false); // Or handle error as needed
            }
        } else {
            // Development: Allow localhost origin (or your development origin if different)
            allowedOrigins.push(process.env.CORS_ORIGIN || `http://localhost:${port}`); // Fallback to 5173 if CORS_ORIGIN is not set for dev
        }


        if (!origin) { // For requests that do not have an origin (like server-to-server)
            return callback(null, true); // Allow (or decide based on your needs)
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy violation for origin: ${origin}`), false);
        }
    },
    credentials: true // Required for cookies
}));


// Routes (rest of your code remains the same)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes(useMockService));
app.use("/dictionaries", dictionaryRoutes);
app.use('/translation', translationRoutes);

// Health check route
app.get('/', (req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', message: 'Lexis API is running' });
});

// Database sync and server start
sequelize
  .sync()
  .then(() => {
    console.log('Database synchronized successfully.');
    app.listen(port, () => {
        console.log(`Server listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database synchronization error:', error);
  });

export default app;