const express = require("express");
const { downloadTranslationDocx } = require("../controllers/export.controller");

const router = express.Router();

router.get("/translations/:id/docx", downloadTranslationDocx);

module.exports = router;
