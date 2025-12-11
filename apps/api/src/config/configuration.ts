export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  payments: {
    deuna: {
      apiKey: process.env.DEUNA_API_KEY,
      webhookSecret: process.env.DEUNA_WEBHOOK_SECRET,
      baseUrl: process.env.DEUNA_BASE_URL || 'https://api.deuna.com',
    },
    payphone: {
      token: process.env.PAYPHONE_TOKEN,
      storeId: process.env.PAYPHONE_STORE_ID,
      webhookSecret: process.env.PAYPHONE_WEBHOOK_SECRET,
      baseUrl: process.env.PAYPHONE_BASE_URL || 'https://pay.payphonetodoesposible.com',
    },
  },
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
  },
});

