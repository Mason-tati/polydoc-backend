const express = require("express");
const upload = require("../middleware/upload");
const { requireAuth } = require("../middleware/auth");
const {
  uploadDocument,
  listDocuments,
  getDocument
} = require("../controllers/document.controller");

const router = express.Router();

router.post("/upload", requireAuth, upload.single("file"), uploadDocument);
router.get("/", requireAuth, listDocuments);
router.get("/:id", requireAuth, getDocument);

module.exports = router;
