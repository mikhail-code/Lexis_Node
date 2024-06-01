"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../3_models/User");
const auth_1 = require("../3_models/auth");
function createUserRoutes(useMockService) {
    const router = express_1.default.Router();
    router.get("/", (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (useMockService) {
            console.log("Using mock data service (GET /users)");
            // Implement mock data logic to return 50 mock users (replace with actual implementation)
            res.json([{ message: "Mock user 1" }, { message: "Mock user 2" }]); // Example mock response
        }
        else {
            console.log("Using real service for GET /users");
            try {
                // Retrieve 50 users from the database (adjust limit as needed)
                const users = yield User_1.User.getUsers(50); // Assuming getUsers is implemented in User model
                if (!users) {
                    return res.status(404).json({ message: "No users found" }); // Handle no users scenario
                }
                res.json(users);
            }
            catch (error) {
                console.error("Error fetching users:", error);
                res.status(500).json({ message: "Error fetching users" });
            }
        }
    }));
    router.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { login, password } = req.body;
        console.log("/login " + req.body + " " + login + " " + password);
        try {
            // Find user by login credential (username or email)
            const user = yield User_1.User.getUserByLogin(login);
            if (!user) {
                return res.status(401).json({ message: "Invalid login credentials" });
            }
            // Compare hashed passwords
            const isPasswordValid = yield user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password" });
            }
            // Generate and return auth token on successful login
            const token = (0, auth_1.generateAuthToken)(user.id);
            res.json({ message: "Login successful", token });
        }
        catch (error) {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Error logging in" });
        }
    }));
    router.post("/register", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, surname = "", country = "", login, } = req.body; // Destructure registration data with optional fields
        if (useMockService) {
            console.log("Using mock user data for registration");
            // Implement mock registration logic (simulate user creation)
            res.json({ message: "Mock user registered successfully" }); // Example mock response
        }
        else {
            console.log("Using real service for registration");
            try {
                // Create a new User object with all properties
                const newUser = new User_1.User("", name, surname, login, password, email, country, new Date(), { base_language: "en", learning_languages: [] });
                // Call User.createUser to add the user to the database
                const createdUser = yield User_1.User.createUser(newUser);
                res.status(201).json({
                    message: `User created successfully with ID: ${createdUser.id}`,
                });
            }
            catch (error) {
                console.error("Error creating user:", error);
                res.status(500).json({ message: "Error creating user" });
            }
        }
    }));
    return router;
}
exports.default = createUserRoutes;
