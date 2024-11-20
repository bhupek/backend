import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
}

export interface AWSConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
  bucketName?: string;
}

export interface Config {
  port: number;
  jwtSecret: string;
  database: DatabaseConfig;
  aws: AWSConfig;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  database: {
    database: process.env.DB_NAME || 'school_management',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME
  }
};

export default config;
