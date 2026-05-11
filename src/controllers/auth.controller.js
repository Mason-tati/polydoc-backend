const prisma = require("../db");
const {
  hashPassword,
  comparePassword,
  signToken,
  publicUser,
} = require("../services/auth.service");

function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body || {};

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: await hashPassword(password),
        name: name || null,
        role: "USER",
      },
    });

    const token = signToken(user);

    res.status(201).json({
      message: "Account created.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!validateEmail(email) || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res) {
  res.json({
    user: req.user,
  });
}

module.exports = {
  register,
  login,
  me,
};
