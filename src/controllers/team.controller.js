const prisma = require("../db");
const { ensureDefaultTeamForUser, getPrimaryTeamForUser } = require("../services/team.service");

async function getMyTeam(req, res, next) {
  try {
    let team = await getPrimaryTeamForUser(req.user.id);

    if (!team) {
      team = await ensureDefaultTeamForUser(req.user);
      team = await getPrimaryTeamForUser(req.user.id);
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
}

async function renameMyTeam(req, res, next) {
  try {
    const { name } = req.body || {};

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Team name is required." });
    }

    const team = await getPrimaryTeamForUser(req.user.id);

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    if (team.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Only the team owner can rename the team." });
    }

    const updated = await prisma.team.update({
      where: { id: team.id },
      data: { name: name.trim() },
    });

    res.json({ team: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyTeam,
  renameMyTeam,
};
