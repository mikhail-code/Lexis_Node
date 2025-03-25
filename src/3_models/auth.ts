import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  Default
} from 'sequelize-typescript';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { authConfig } from '../0_config/auth.config';
import User from './User';

@Table({ tableName: 'auths', timestamps: true })
export class Auth extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column(DataType.STRING)
  token!: string;

  @Column(DataType.STRING)
  type!: 'refresh' | 'access';

  @Column(DataType.DATE)
  expiresAt!: Date;

  static async createRefreshToken(userId: string): Promise<Auth> {
    const token = jwt.sign({ userId }, authConfig.jwtSecret, {
      expiresIn: authConfig.refreshTokenExpiresIn
    });

    const expiresAt = new Date(Date.now() + authConfig.cookieMaxAge);

    return await Auth.create({
      userId,
      token,
      type: 'refresh',
      expiresAt
    });
  }

  static async createAccessToken(userId: string): Promise<{ token: string, expiresIn: string }> {
    const token = jwt.sign({ userId }, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn
    });

    return {
      token,
      expiresIn: authConfig.jwtExpiresIn
    };
  }

  static async validateRefreshToken(token: string): Promise<Auth | null> {
    try {
      const decoded = jwt.verify(token, authConfig.jwtSecret) as { userId: string };
      const refreshToken = await Auth.findOne({
        where: {
          token,
          type: 'refresh',
          userId: decoded.userId,
          expiresAt: {
            [Op.gt]: new Date()
          }
        }
      });

      return refreshToken;
    } catch (error) {
      return null;
    }
  }

  static async invalidateRefreshToken(token: string): Promise<void> {
    await Auth.destroy({
      where: {
        token,
        type: 'refresh'
      }
    });
  }
}

export default Auth;