import express from "express";
import { User } from "../3_models/User";
import { generateAuthToken } from "../3_models/auth";

interface LoginRequest {
  login: string;
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

export default function createUserRoutes(
  useMockService: boolean
): express.Router {
  const router = express.Router();

  router.get("/", async (req: express.Request, res: express.Response) => {
    if (useMockService) {
      console.log("Using mock data service (GET /users)");
      // Implement mock data logic to return 50 mock users (replace with actual implementation)
      res.json([{ message: "Mock user 1" }, { message: "Mock user 2" }]); // Example mock response
    } else {
      console.log("Using real service for GET /users");
      try {
        // Retrieve 50 users from the database (adjust limit as needed)
        const users = await User.getUsers(50); // Assuming getUsers is implemented in User model

        if (!users) {
          return res.status(404).json({ message: "No users found" }); // Handle no users scenario
        }

        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users" });
      }
    }
  });

  router.post(
    "/login",
    async (req: express.Request<LoginRequest>, res: express.Response) => {
      const { login, password } = req.body;

      try {
        // Find user by login credential (username or email)
        const user = await User.getUserByLogin(login);

        if (!user) {
          return res.status(401).json({ message: "Invalid login credentials" });
        }

        // Compare hashed passwords
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password" });
        }

        // Generate and return auth token on successful login
        const token = generateAuthToken(user.id);
        res.json({ message: "Login successful", token });
      } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Error logging in" });
      }
    }
  );

  router.post(
    "/register",
    async (req: express.Request<RegisterRequest>, res: express.Response) => {
      const {
        name,
        email,
        password,
        surname = "",
        country = "",
        login,
      } = req.body; // Destructure registration data with optional fields

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
  );

  return router;
}
