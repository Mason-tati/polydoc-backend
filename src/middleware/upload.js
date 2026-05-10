const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const originalsDir = path.join(uploadRoot, "originals");

fs.mkdirSync(originalsDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, originalsDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_BYTES || 25 * 1024 * 1024)
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only PDF, DOCX, and TXT files are supported in Phase 2A."));
    }
    cb(null, true);
  }
});

module.exports = upload;
