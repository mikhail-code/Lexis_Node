"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../3_models/User");
const bcrypt = __importStar(require("bcryptjs"));
describe("User class password hashing and comparison", () => {
    it("should hash a password and compare it correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        const userLoginData = new User_1.User(undefined, "Name", "SurName", "Test User", "password", "test@example.com", "test_country", new Date(), { base_language: "base_language", learning_languages: [] } // Corrected object literal syntax
        );
        // Hash the password
        const hashedPassword = yield userLoginData.hashPassword(userLoginData.password);
        // Simulate retrieving user from the database (replace with actual logic)
        const userDBData = new User_1.User(undefined, "Name", "SurName", "Test User", hashedPassword, "test@example.com", "test_country", new Date(), { base_language: "base_language", learning_languages: [] } // Corrected object literal syntax
        );
        console.log("userLoginData.password " + userLoginData.password);
        console.log("userDBData.password " + userDBData.password);
        // Compare passwords
        const isPasswordValid = yield bcrypt.compare(userLoginData.password, userDBData.password);
        expect(isPasswordValid).toBe(true);
    }));
});
// 1. Registration Process
// User Registration (Client)
// The user inputs their credentials (e.g., username and password).
// The password is sent to the server over a secure connection (HTTPS).
// Password Hashing and Storage (Server)
// The server receives the registration request.
// The server hashes the password using a secure hashing algorithm.
// The hashed password is stored in the database.
// 2. Login Process
// User Login (Client)
// The user inputs their credentials (e.g., username and password).
// The password is sent to the server over a secure connection (HTTPS).
// Password Verification (Server)
// The server receives the login request.
// The server retrieves the stored hashed password from the database.
// The server compares the hashed password with the hash of the provided password.
// If they match, the user is authenticated.
