import { registerAs } from "@nestjs/config";

export default registerAs("security", () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || "1d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "Content-Range"],
    credentials: true,
    maxAge: 86400, // 24 hours
  },
  password: {
    saltRounds: process.env.PASSWORD_SALT_ROUNDS
      ? Number.parseInt(process.env.PASSWORD_SALT_ROUNDS)
      : 10,
  },
  login: {
    maxAttempts: process.env.MAX_LOGIN_ATTEMPTS
      ? Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS)
      : 5,
    lockoutMinutes: process.env.LOGIN_LOCKOUT_MINUTES
      ? Number.parseInt(process.env.LOGIN_LOCKOUT_MINUTES)
      : 15,
  },
}));
