import rateLimit from "express-rate-limit";

// Contact form: 5 attempts / 15 minutes.
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives. Veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login: 10 attempts / hour.
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives. Veuillez réessayer plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});
