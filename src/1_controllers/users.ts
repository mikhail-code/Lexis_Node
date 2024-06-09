import createError from 'http-errors';
import { Request, Response, NextFunction } from 'express';

import express from "express";
import { User } from "../3_models/user";
import { generateAuthToken } from "../3_models/auth";


async function getUsers(req: express.Request, res: express.Response) {
  const useMockService = req.app.get("useMockService"); // Access app-level flag

  // ... Implement logic using useMockService as before (get users)
}
// async function getAuthenticatedUser(
//     req: express.Request<any, any, { userId: string }>, // Use the extended Request type
//     res: express.Response,
//     next: express.NextFunction
//   ): Promise<void | express.Response<any, any>> {
//     try {
//       // Extract userId from the request (assuming it's stored somewhere)
//       const userId = req.userId; // Adapt this based on how you store the user ID
  
//       // Find the user using the userId
//       const user = await User.getUserById(userId);
  
//       if (user) {
//         // User found, return success response with sanitized user data
//         const sanitizedUser = {
//           id: user.id,
//           name: user.name,
//           surname: user.surname,
//           login: user.login, // Consider including or excluding login based on security needs
//           email: user.email,
//           country: user.country,
//           birth_date: user.birth_date.toISOString(), // Convert birth_date to ISO string
//           config: user.config,
//         };
//         return res.status(200).json({ data: sanitizedUser });
//       }
  
//       // User not found, return Not Found error
//       const error = createError.NotFound("User not found");
//       throw error;
//     } catch (error) {
//       // Handle errors appropriately, potentially logging or returning a generic error
//       console.error("Error fetching authenticated user:", error);
//       return next(error);
//     }
//   }

export { getUsers };
