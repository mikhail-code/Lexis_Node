import express, { RequestHandler, Response } from "express";
import { loginUser, registerUser, logout, refreshToken } from "../1_controllers/auth";
import { validateRequest } from "../4_middlewares/validation";
import { loginSchema, registerSchema } from "../validation/auth.schema";
import { AuthenticatedRequest } from "../types/auth.types";

const router = express.Router();

// Helper to type the request handlers
const handler = <T>(fn: (req: AuthenticatedRequest, res: Response) => Promise<T>): RequestHandler => {
  return (req, res, next) => fn(req as AuthenticatedRequest, res).catch(next);
};

// Create a properly typed wrapper for the auth controllers
const wrapController = {
  login: (req: AuthenticatedRequest, res: Response) => loginUser(req, res),
  register: (req: AuthenticatedRequest, res: Response) => registerUser(req, res),
  logout: (req: AuthenticatedRequest, res: Response) => logout(req, res),
  refresh: (req: AuthenticatedRequest, res: Response) => refreshToken(req, res)
};

// Authentication routes
router.post("/login", validateRequest(loginSchema), handler(wrapController.login));
router.post("/register", validateRequest(registerSchema), handler(wrapController.register));
router.post("/logout", handler(wrapController.logout));
router.post("/refresh", handler(wrapController.refresh));

export default router;
