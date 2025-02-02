import { Router } from 'express';
import { UserController } from '../1_controllers/users';
import { isAuthenticated } from '../4_middlewares/auth';
import { validateRequest } from '../4_middlewares/validation';
import { loginSchema, registerSchema } from '../validation/auth.schema';

export default function createUserRoutes(useMockService = false): Router {
  const router = Router();

  if (useMockService) {
    // Mock routes implementation
    router.get('/', (_, res) => {
      res.json([{ message: "Mock user 1" }, { message: "Mock user 2" }]);
    });

    router.post('/login', (_, res) => {
      res.json({ message: "Mock login successful" });
    });

    router.post('/register', (_, res) => {
      res.json({ message: "Mock user registered successfully" });
    });

    return router;
  }

  // Real routes with proper middleware
  router.get('/', isAuthenticated, UserController.getUsers);
  router.get('/:id', isAuthenticated, UserController.getUserById);
  router.post('/login', validateRequest(loginSchema), UserController.login);
  router.post('/register', validateRequest(registerSchema), UserController.register);

  return router;
}
