// import jwt from 'jsonwebtoken';
// // import config from '../0_config/config';
// import * as dotenv from 'dotenv';
// import ms = require("ms")

// dotenv.config();

// const jwtSecret = process.env.JWT_SECRET as string;

// export function generateAuthToken(userId: string): string {
//   const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '12h' }); 
//   return token;
// }


// // New code:

// import { Pool, PoolClient } from "pg";
// import config from "../0_config/database";

// const pool = new Pool(config);

// export async function validateRefreshToken(refreshToken: string): Promise<any | null> {
//   const client: PoolClient = await pool.connect();
//   try {
//     const result = await client.query(
//       "SELECT * FROM Auth WHERE refreshToken = $1",
//       [refreshToken]
//     );

//     // Check if a refresh token is found
//     if (result.rows.length === 0) {
//       return null;
//     }

//     // Check if the refresh token has expired
//     const expirationTime = result.rows[0].expirationTime;
//     const currentTime = Date.now();
//     if (currentTime > expirationTime) {
//       return null; // Expired token
//     }

//     // Return the user ID associated with the refresh token (assuming it's valid)
//     return { userId: result.rows[0].userId }; // You might need more info from Auth table
//   } finally {
//     client.release();
//   }
// }

// export async function saveAuthToken(userId: string, token: string): Promise<void> {
//   const client: PoolClient = await pool.connect();
//   try {
//     // Assuming expiration time is calculated before calling this function (in hours)
//     const expirationTime = Date.now() + ms('12h');

//     await client.query(
//       "INSERT INTO Auth (userId, refreshToken, expirationTime) VALUES ($1, $2, $3)",
//       [userId, token, expirationTime]
//     );
//   } finally {
//     client.release();
//   }
// }
