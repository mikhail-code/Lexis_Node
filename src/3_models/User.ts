import { Pool, PoolClient } from "pg";
import config from "../0_config/database";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";

const pool = new Pool(config);

interface UserConfig {
  base_language: string;
  learning_languages: string[];
}

export class User {
  id: string;
  name: string;
  surname: string;
  login: string;
  password: string;
  email: string;
  country: string;
  birth_date: Date;
  config: UserConfig;

  constructor(
    id: string = uuidv4(),
    name: string,
    surname: string,
    login: string,
    password: string,
    email: string,
    country: string,
    birth_date: Date,
    config: UserConfig
  ) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.login = login;
    this.password = password;
    this.email = email;
    this.country = country;
    this.birth_date = birth_date;
    this.config = config;
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password: string): Promise<boolean> {
    // Compare the provided password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, this.password);
    return isPasswordMatch;
  }
  static async createUser(user: User): Promise<User> {
    //creating and storing user data in the database
    const client: PoolClient = await pool.connect();
    const hashedPassword = await user.hashPassword(user.password);
    try {
      const result = await client.query(
        "INSERT INTO users (name, surname, login, password, email, country, birth_date, config) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          user.name,
          user.surname,
          user.login,
          hashedPassword,
          user.email,
          user.country,
          user.birth_date,
          user.config,
        ]
      );
      // Destructuring to create User object
      return new User(
        result.rows[0].id,
        result.rows[0].name,
        result.rows[0].surname,
        result.rows[0].login,
        result.rows[0].password,
        result.rows[0].email,
        result.rows[0].country,
        result.rows[0].birth_date,
        result.rows[0].config
      );
    } finally {
      client.release();
    }
  }

  static async getUserByLogin(login: string): Promise<User | null> { //or EMail
    const client: PoolClient = await pool.connect();
    try {
      let result = await client.query("SELECT * FROM users WHERE login = $1", [
        login,
      ]);
      if (result.rows.length === 0) {
        result = await client.query("SELECT * FROM users WHERE email = $1", [
          login,
        ]);
        if (result.rows.length === 0) {
          return null;
        }
      }
      // Destructuring to create User object
      return new User(
        result.rows[0].id,
        result.rows[0].name,
        result.rows[0].surname,
        result.rows[0].login,
        result.rows[0].password,
        result.rows[0].email,
        result.rows[0].country,
        result.rows[0].birth_date,
        result.rows[0].config
      );
    } finally {
      client.release();
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return null;
      }
      // Destructuring to create User object
      return new User(
        result.rows[0].id,
        result.rows[0].name,
        result.rows[0].surname,
        result.rows[0].login,
        result.rows[0].password,
        result.rows[0].email,
        result.rows[0].country,
        result.rows[0].birth_date,
        result.rows[0].config
      );
    } finally {
      client.release();
    }
  }

  static async getUsers(limit: number): Promise<User[] | null> {
    const client: PoolClient = await pool.connect();
    try {
      const result = await client.query("SELECT * FROM users LIMIT $1", [
        limit,
      ]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows.map(
        (row) =>
          new User(
            row.id,
            row.name,
            row.surname,
            row.login,
            row.password,
            row.email,
            row.country,
            row.birth_date,
            row.config
          )
      );
    } finally {
      client.release();
    }
  }

  // Add similar methods for other functionalities like update, delete etc.
}
