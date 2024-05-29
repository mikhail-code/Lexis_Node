import { User } from "../3_models/User";
import * as bcrypt from "bcryptjs";

describe("User class password hashing and comparison", () => {
  it("should hash a password and compare it correctly", async () => {
    const userLoginData = new User(
      undefined, 
      "Name",
      "SurName",
      "Test User",
      "password",
      "test@example.com",
      "test_country",
      new Date(),
      { base_language: "base_language", learning_languages: [] } // Corrected object literal syntax
    );

    // Hash the password
    const hashedPassword = await userLoginData.hashPassword(userLoginData.password);

    // Simulate retrieving user from the database (replace with actual logic)
    const userDBData = new User(
      undefined, 
      "Name",
      "SurName",
      "Test User",
      hashedPassword,
      "test@example.com",
      "test_country",
      new Date(),
      { base_language: "base_language", learning_languages: [] } // Corrected object literal syntax
    );
    console.log("userLoginData.password " + userLoginData.password)
    console.log("userDBData.password " + userDBData.password)
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(
      userLoginData.password,
      userDBData.password
    );

    expect(isPasswordValid).toBe(true);
  });
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
