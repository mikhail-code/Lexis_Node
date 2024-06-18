import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

import express from "express";
import { User } from "../3_models/user";
import { generateAuthToken } from "../3_models/auth";
import { validateRefreshToken } from "../3_models/auth";

import jwt from "jsonwebtoken";
import ms from "ms";

// import { clearTokens, generateJWT } from "../5_utils/auth";

interface LoginRequest {
  login: string; //or email
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  birthDate?: Date;
  surname?: string;
  country?: string;
  login: string;
}

async function loginUser(
  req: express.Request<LoginRequest>,
  res: express.Response
) {
  const { login, password } = req.body;
  console.log("/login " + req.body + " " + login + " " + password);

  try {
    const user = await User.getUserByLogin(login);

    if (!user) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    // Comparing hashed passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }

    // Generate and return auth token on successful login
    const token = generateAuthToken(user.id);

    // Create a user object with all attributes
    const userToReturn = {
      userID: user.id,
      userLogin: user.login,
      name: user.name,
      surname: user.surname,
      email: user.email,
      country: user.country,
      configuration: user.config,
    };

    res.json({ message: "Login successful", token, user: userToReturn });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in" });
  }
}

async function registerUser(
  req: express.Request<RegisterRequest>,
  res: express.Response,
  useMockService: boolean
) {
  const { name, email, password, surname = "", country = "", login } = req.body; // Destructure registration data with optional fields

  if (useMockService) {
    console.log("Using mock user data for registration");
    // Implement mock registration logic (simulate user creation)
    res.json({ message: "Mock user registered successfully" }); // Example mock response
  } else {
    console.log("Using real service for registration");
    try {
      // Create a new User object with all properties
      const newUser = new User(
        "",
        name,
        surname,
        login,
        password,
        email,
        country,
        new Date(),
        { base_language: "en", learning_languages: [] }
      );

      // Call User.createUser to add the user to the database
      const createdUser = await User.createUser(newUser);

      res.status(201).json({
        message: `User created successfully with ID: ${createdUser.id}`,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }
}

// async function logout(req: Request, res: Response, next: NextFunction) {
//   await clearTokens(req, res, next);
//   return res.sendStatus(204);
// }

// const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
//       // Retrieve environment variables and cookies
//   const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE } = process.env;
//   const { signedCookies } = req;
//   const { refreshToken } = signedCookies;

//   // Check for refresh token existence
//   if (!refreshToken) {
//     return res.sendStatus(204); // No content, indicating missing refresh token
//   }

//   try {
//     // Validate refresh token against database (asynchronous)
//     const refreshTokenInDB = await validateRefreshToken(refreshToken);

//     if (!refreshTokenInDB) {
//       // Clear tokens and handle unauthorized access
//       await clearTokens(req, res, next);
//       const error = createError.Unauthorized();
//       throw error;
//     }

//     // Fetch user data based on user ID from refresh token
//     const userId = refreshTokenInDB.userId; // Assuming `validateRefreshToken` provides user ID
//     const user = await User.getUserById(userId); // Fetch user data asynchronously

//     if (!user) {
//       // Clear tokens and handle invalid credentials
//       await clearTokens(req, res, next);
//       const error = createError(401, 'Invalid credentials');
//       throw error;
//     }

//     // Generate a new access token
//     const accessToken = generateJWT(user.id, ACCESS_TOKEN_SECRET as string, ACCESS_TOKEN_LIFE as string);

//     // Return successful response with user, access token, and expiry details
//     return res.status(200).json({
//       user,
//       accessToken,
//       expiresAt: new Date(Date.now() + ms(ACCESS_TOKEN_LIFE as string)),
//     });
//   } catch (error) {
//     // Handle errors appropriately, potentially logging or returning a generic error
//     console.error('Error refreshing access token:', error);
//     return next(error); // Pass error to middleware for handling
//   }
//   };

// export { loginUser, registerUser, logout, refreshAccessToken };
