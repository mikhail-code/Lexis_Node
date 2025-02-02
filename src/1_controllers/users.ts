import { Request, Response } from 'express';
import { User } from '../3_models/User';
import { generateAuthToken } from '../4_middlewares/auth';
import { LoginRequest, RegisterRequest, UserResponse } from '../types/Types';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await User.getUsers(50);
      if (!users?.length) {
        return res.status(404).json({ message: "No users found" });
      }
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    const { login, password } = req.body;

    try {
      const user = await User.getUserByLogin(login);
      if (!user) {
        return res.status(401).json({ message: "Invalid login credentials" });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid login credentials" });
      }

      const token = generateAuthToken(user.id);
      const userResponse: UserResponse = {
        userLogin: user.login,
        userID: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        country: user.country,
        configuration: user.config
      };

      res.json({ 
        message: "Login successful", 
        token, 
        user: userResponse 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  }

  static async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    const {
      name,
      email,
      password,
      surname = "",
      country = "",
      login,
      birthDate = new Date()
    } = req.body;

    try {
      const userConfig = { 
        base_language: "en", 
        learning_languages: [] 
      };

      const userData = {
        name,
        surname,
        login,
        password,
        email,
        country,
        birth_date: birthDate,
        config: userConfig,
        subscribedDictionaries: []
      };

      const createdUser = await User.createUser(userData);

      res.status(201).json({
        message: `User created successfully with ID: ${createdUser.id}`,
        userId: createdUser.id
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await User.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  }

  static async getAuthenticatedUser(req: Request, res: Response) {
    try {
      const user = await User.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  }
}