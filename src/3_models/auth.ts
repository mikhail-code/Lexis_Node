import jwt from 'jsonwebtoken';
// import config from '../0_config/config';
import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET as string;

export function generateAuthToken(userId: string): string {
  const token = jwt.sign({ userId }, jwtSecret, { expiresIn: '12h' }); 
  return token;
}
