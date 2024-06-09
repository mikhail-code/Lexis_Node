
// import express, { Router } from 'express';

// import authController from '../1_controllers/auth';
// import authMiddleware from '../4_middlewares/auth';

// const router: Router = express.Router();

// router.post(
//     '/sign-up',
//     authController.signUp,
//     authMiddleware.generateAuthTokens
// );

// router.post(
//     '/login',
//     authController.login,
//     authMiddleware.generateAuthTokens
// );

// router.post(
//     '/logout',
//     authMiddleware.isAuthenticated,
//     authController.logout
// );

// router.post(
//     '/refresh',
//     authController.refreshAccessToken
// );

// export default router;






//  my code
// import express from "express";
// import { User } from "../3_models/user";
// import { generateAuthToken } from "../3_models/auth";
// import { loginUser, registerUser } from "../1_controllers/auth"; // Import controller functions

// export default function createUserRoutes(
//   useMockService: boolean
// ): express.Router {
//   const router = express.Router();

//   router.post("/login", loginUser); // Use function from controller

//   router.post("/register", registerUser); // Use function from controller

//   return router;
// }
