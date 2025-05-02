import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: process.env.ANTHROPIC_MODEL_NAME || 'claude-3-opus-20240229',
    maxTokens: process.env.ANTHROPIC_MAX_TOKENS ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10) : 1000,
  },
  github: {
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com',
  },
}));
