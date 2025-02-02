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
import { v4 as uuidv4 } from 'uuid';
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

  @Column(DataType.DATE)
  expiresAt!: Date;
}
export default Auth;