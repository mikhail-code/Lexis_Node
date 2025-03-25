import { Router, RequestHandler, Response } from 'express';
import { UserController } from '../1_controllers/users';
import { isAuthenticated } from '../4_middlewares/auth';
import { AuthenticatedRequest } from '../types/auth.types';

// Helper to type the request handlers
const handler = <T>(fn: (req: AuthenticatedRequest, res: Response) => Promise<T>): RequestHandler => {
  return (req, res, next) => fn(req as AuthenticatedRequest, res).catch(next);
};

// Create a properly typed wrapper for the controller methods
const wrapController = {
  getUsers: (req: AuthenticatedRequest, res: Response) => UserController.getUsers(req, res),
  getAuthenticatedUser: (req: AuthenticatedRequest, res: Response) => UserController.getAuthenticatedUser(req, res),
  getUserById: (req: AuthenticatedRequest, res: Response) => UserController.getUserById(req, res)
};

export default function createUserRoutes(useMockService = false): Router {
  const router = Router();

  if (useMockService) {
    // Mock routes implementation
    router.get('/', (_, res) => {
      res.json([{ message: "Mock user 1" }, { message: "Mock user 2" }]);
    });

    router.get('/me', (_, res) => {
      res.json({ message: "Mock user data" });
    });

    return router;
  }

  // User management routes
  router.get('/', isAuthenticated, handler(wrapController.getUsers));
  router.get('/me', isAuthenticated, handler(wrapController.getAuthenticatedUser));
  router.get('/:id', isAuthenticated, handler(wrapController.getUserById));

  return router;
}
