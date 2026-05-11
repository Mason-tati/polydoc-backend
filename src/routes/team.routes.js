const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMyTeam, renameMyTeam } = require("../controllers/team.controller");

const router = express.Router();

router.get("/me", requireAuth, getMyTeam);
router.patch("/me", requireAuth, renameMyTeam);

module.exports = router;
