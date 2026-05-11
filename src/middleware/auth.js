const jwt = require("jsonwebtoken");
const prisma = require("../db");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET is not configured." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};
