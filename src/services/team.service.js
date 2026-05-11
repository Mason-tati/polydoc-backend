const prisma = require("../db");

async function ensureDefaultTeamForUser(user) {
  const existing = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: { team: true },
  });

  if (existing) {
    return existing.team;
  }

  const team = await prisma.team.create({
    data: {
      name: user.name ? `${user.name}'s Team` : `${user.email}'s Team`,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  return team;
}

async function getPrimaryTeamForUser(userId) {
  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return membership?.team || null;
}

function canManageBilling(team, userId) {
  if (!team) return false;
  return team.ownerId === userId;
}

module.exports = {
  ensureDefaultTeamForUser,
  getPrimaryTeamForUser,
  canManageBilling,
};
