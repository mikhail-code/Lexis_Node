import { Request, Response } from "express";
import { User } from "../3_models/User";
import Auth from "../3_models/Auth";
import { authConfig } from "../0_config/auth.config";
import { LoginRequest, RegisterRequest, UserResponse, AuthenticatedRequest } from "../types/auth.types";

export const loginUser = async (req: Request<any, any, LoginRequest>, res: Response) => {
  const { login, password } = req.body;

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

    // Generate access and refresh tokens
    const { token: accessToken, expiresIn } = await Auth.createAccessToken(user.id);
    const refreshToken = await Auth.createRefreshToken(user.id);

    // Create a user object with all attributes
    const userToReturn: UserResponse = {
      userID: user.id,
      userLogin: user.login,
      name: user.name,
      surname: user.surname,
      email: user.email,
      country: user.country,
      configuration: user.config,
    };

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authConfig.cookieMaxAge
    });

    res.json({
      message: "Login successful",
      token: accessToken,
      user: userToReturn,
      expiresIn
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

export const registerUser = async (req: Request<any, any, RegisterRequest>, res: Response) => {
  const { name, email, password, surname = "", country = "", login, birthDate } = req.body;

  try {
    const newUser = {
      name,
      surname,
      login,
      password,
      email,
      country,
      birth_date: birthDate ? new Date(birthDate) : new Date(),
      config: { base_language: "en", learning_languages: [] },
      subscribedDictionaries: []
    };

    const createdUser = await User.createUser(newUser);

    res.status(201).json({
      message: `User created successfully with ID: ${createdUser.id}`,
      userId: createdUser.id
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await Auth.invalidateRefreshToken(refreshToken);
    }
    res.clearCookie('refreshToken');
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Error during logout' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const refreshTokenDoc = await Auth.validateRefreshToken(refreshToken);

    if (!refreshTokenDoc) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.getUserById(refreshTokenDoc.userId);

    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'User not found' });
    }

    const { token: accessToken, expiresIn } = await Auth.createAccessToken(user.id);

    return res.json({
      accessToken,
      expiresIn
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({ message: 'Error refreshing token' });
  }
};
