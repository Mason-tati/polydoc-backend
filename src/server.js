require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const documentRoutes = require("./routes/document.routes");
const authRoutes = require("./routes/auth.routes");
const teamRoutes = require("./routes/team.routes");
const billingRoutes = require("./routes/billing.routes");
const translationRoutes = require("./routes/translation.routes");
const exportRoutes = require("./routes/export.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("combined"));

app.get("/", (_req, res) => {
  res.json({
    name: "TranslateManual.ai Backend",
    status: "online",
    version: "1.6.0"
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "TranslateManual.ai Backend",
    phase: "5B"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/exports", exportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large." });
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`TranslateManual.ai backend running on port ${PORT}`);
});
