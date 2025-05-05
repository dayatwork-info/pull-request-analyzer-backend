import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  environment: 'test',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    encryptionKey: process.env.ENCRYPTION_KEY,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    modelName: process.env.ANTHROPIC_MODEL_NAME,
    maxTokens: process.env.ANTHROPIC_MAX_TOKENS
      ? parseInt(process.env.ANTHROPIC_MAX_TOKENS, 10)
      : 4096,
  },
  github: {
    apiUrl: process.env.GITHUB_API_URL,
  },
  journal: {
    origin: process.env.WORK_JOURNAL_ORIGIN,
  },
}));