import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5201', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me',
    accessExpiresIn: '2h',
    refreshExpiresIn: '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5200',
    credentials: true,
  },

  sms: {
    accessKeyId: process.env.ALIBABA_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '',
    templateCode: process.env.SMS_TEMPLATE_CODE || '',
  },

  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
} as const;
