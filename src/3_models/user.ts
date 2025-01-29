import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  IsEmail,
  AllowNull,
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { Dictionary } from '../3_models/dictionary'; // Import the User model


// Define the UserConfig interface
interface UserConfig {
  base_language: string;
  learning_languages: string[];
}

// Define the User model

@Table({ tableName: 'users', timestamps: false })
export class User extends Model {
  @Column({ type: DataType.UUID, primaryKey: true,
    defaultValue: uuidv4() })
  id!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  name!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  surname!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING, unique: true })
  login!: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  password!: string;

  @IsEmail
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Column({ type: DataType.STRING })
  country!: string;

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  birth_date!: Date;

  @Column({ type: DataType.JSON })
  config!: UserConfig;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  subscribedDictionaries!: Array<string>;
  

  // Hash the user's password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare the provided password with the hashed password
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Create a new user
  static async createUser(data: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });
    return newUser;
  }

  // Get a user by login or email
  static async getUserByLogin(login: string): Promise<any | null> {
    return User.findOne({
      where: {
        [Op.or]: [ //Sequelize's Op.or for logical operations within the where clause.
          { login },
          { email: login }
        ],
      },
    });
  }

  // Get a user by ID
  static async getUserById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  // Get a list of users with a limit
  static async getUsers(limit: number): Promise<User[]> {
    return User.findAll({ limit });
  }
}