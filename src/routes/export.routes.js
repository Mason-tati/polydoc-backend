const express = require("express");
const { downloadTranslationDocx, downloadTranslationPdf } = require("../controllers/export.controller");

const router = express.Router();

router.get("/translations/:id/docx", downloadTranslationDocx);
router.get("/translations/:id/pdf", downloadTranslationPdf);

module.exports = router;
