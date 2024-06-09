// import express from "express"; // Assuming you're using Express for request handling
// import jwt from "jsonwebtoken"; // For JSON Web Token generation
// import createError from "http-errors";
// import ms from "ms"; // For parsing time durations
// import { saveAuthToken } from "../3_models/auth";

// // Assuming you have a separate utility file for JWT generation
// import { generateJWT } from "../utils/auth";


// // Assuming you have environment variables set for these values
// const ACCESS_TOKEN_LIFE: string = process.env.ACCESS_TOKEN_LIFE || "";
// const REFRESH_TOKEN_LIFE: string = process.env.REFRESH_TOKEN_LIFE || "";
// const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET || "";
// const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET || "";
// const NODE_ENV: string = process.env.NODE_ENV || "";

// interface Token {
//   refreshToken: string;
//   userId: string;
//   expirationTime: number;
// }

// const dev = NODE_ENV === "development";

// import { Pool, PoolClient } from "pg";
// import config from "../0_config/database";

// const pool = new Pool(config);

// async function calculateExpirationTime(duration: string): Promise<number> {
//   return Date.now() + ms(duration);
// }

// export async function generateAuthTokens(
//   req: express.Request<any, any, { userId: string }>, // Use the extended Request type
//   res: express.Response,
//   next: express.NextFunction
// ): Promise<void | express.Response<any, any>> {
//   try {
//     // Extract userId from the request (assuming it's stored somewhere)
//     const userId = req.userId;

//     // Find the user using userId
//     const user = await User.getUserById(userId);

//     if (!user) {
//       throw createError.NotFound("User not found"); // Handle user not found error
//     }

//     const refreshToken = generateJWT(userId, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE);
//     const accessToken = generateJWT(userId, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE);

//     const expirationTime = await calculateExpirationTime(REFRESH_TOKEN_LIFE);

//     const token: Token = {
//       refreshToken,
//       userId,
//       expirationTime,
//     };

//     // Call saveAuthToken to store the token in the database
//     await saveAuthToken(userId, refreshToken);

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: !dev,
//       signed: true,
//       expires: new Date(expirationTime),
//     });

//     const expiresAt = new Date(Date.now() + ms(ACCESS_TOKEN_LIFE));

//     return res.status(200).json({
//       user,
//       token: accessToken,
//       expiresAt,
//     });
//   } catch (error) {
//     return next(error);
//   }
// }

// export const isAuthenticated = async (
//     req: express.Request,  // Use the extended Request type
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     try {
//       const authToken = req.get('Authorization');
//       const accessToken = authToken?.split('Bearer ')[1];
//       if (!accessToken) {
//         const error = createError.Unauthorized();
//         throw error;
//       }
  
//       const { signedCookies = {} } = req;
//       const { refreshToken } = signedCookies;
//       if (!refreshToken) {
//         const error = createError.Unauthorized();
//         throw error;
//       }
  
//       let decodedToken;
// try {
//   decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
// } catch (err) {
//   const error = createError.Unauthorized();
//   return next(error);
// }

// const { userId } = decodedToken;

// const user = await User.getUserById(userId);
// if (!user) {
//   const error = createError.Unauthorized();
//   throw error;
// }

// // Assuming you want to set userId on the request object for further use
// req.userId = user.id;
  
  
//       return next();
//     } catch (error) {
//       return next(error);
//     }
//   };
  
//   export default {
//     generateAuthTokens,
//     isAuthenticated,
//   };