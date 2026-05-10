const express = require("express");
const upload = require("../middleware/upload");
const {
  uploadDocument,
  listDocuments,
  getDocument
} = require("../controllers/document.controller");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.get("/:id", getDocument);

module.exports = router;
