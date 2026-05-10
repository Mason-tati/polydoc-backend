const express = require("express");
const {
  translateDocument,
  listTranslations,
  getTranslation,
  downloadTranslation
} = require("../controllers/translation.controller");

const router = express.Router();

router.post("/documents/:id/translate", translateDocument);
router.get("/", listTranslations);
router.get("/:id", getTranslation);
router.get("/:id/download", downloadTranslation);

module.exports = router;
