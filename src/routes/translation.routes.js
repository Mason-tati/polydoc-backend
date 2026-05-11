const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  translateDocument,
  listTranslations,
  getTranslation,
  downloadTranslation
} = require("../controllers/translation.controller");

const router = express.Router();

router.post("/documents/:id/translate", requireAuth, translateDocument);
router.get("/", requireAuth, listTranslations);
router.get("/:id", requireAuth, getTranslation);
router.get("/:id/download", requireAuth, downloadTranslation);

module.exports = router;
