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
  HasMany
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import  Auth  from './Auth';

// Define the UserConfig interface
interface UserConfig {
  base_language: string;
  learning_languages: string[];
}

// Define interface for User creation attributes
interface UserCreationAttributes {
  id?: string;
  name: string;
  surname: string;
  login: string;
  password: string;
  email: string;
  country: string;
  birth_date: Date;
  config: UserConfig;
  subscribedDictionaries: string[];
}

// Define the User model
@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User, UserCreationAttributes> {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  surname!: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  login!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @IsEmail
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  country!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  birth_date!: Date;

  @Column(DataType.JSON)
  config!: UserConfig;

  @Column(DataType.ARRAY(DataType.STRING))
  subscribedDictionaries!: Array<string>;

  @HasMany(() => Auth)
  auths!: Auth[];

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
  static async createUser(data: UserCreationAttributes): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await User.create({
      ...data,
      password: hashedPassword,
      id: data.id ?? uuidv4(),
    });
    return newUser;
  }

  // Get a user by login or email
  static async getUserByLogin(login: string): Promise<User | null> {
    return User.findOne({
      where: {
        [Op.or]: [
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
export default User;