const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { downloadTranslationDocx, downloadTranslationPdf } = require("../controllers/export.controller");

const router = express.Router();

router.get("/translations/:id/docx", requireAuth, downloadTranslationDocx);
router.get("/translations/:id/pdf", requireAuth, downloadTranslationPdf);

module.exports = router;
