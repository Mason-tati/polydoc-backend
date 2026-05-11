const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function requireJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return process.env.JWT_SECRET;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  const secret = requireJwtSecret();

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role || "USER",
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  publicUser,
};
