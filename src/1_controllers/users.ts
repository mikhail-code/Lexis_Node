import { Request, Response } from 'express';
import { User } from '../3_models/User';
import { AuthenticatedRequest, UserResponse } from '../types/auth.types';

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response) {
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

  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await User.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userResponse: UserResponse = {
        userID: user.id,
        userLogin: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        country: user.country,
        configuration: user.config
      };

      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user" });
    }
  }

  static async getAuthenticatedUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await User.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userResponse: UserResponse = {
        userID: user.id,
        userLogin: user.login,
        name: user.name,
        surname: user.surname,
        email: user.email,
        country: user.country,
        configuration: user.config
      };

      res.json(userResponse);
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  }
}