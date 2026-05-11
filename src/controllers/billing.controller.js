const prisma = require("../db");
const { getPrimaryTeamForUser, canManageBilling } = require("../services/team.service");
const {
  getStripe,
  getFrontendUrl,
  getPriceId,
  getPlanFromPriceId,
  getLimitForPlan,
} = require("../services/stripe.service");

async function createCheckoutSession(req, res, next) {
  try {
    const { plan = "pro" } = req.body || {};
    const priceId = getPriceId(plan);

    if (!priceId) {
      return res.status(500).json({
        error: `Stripe price ID is not configured for plan: ${plan}`,
      });
    }

    const stripe = getStripe();
    const frontendUrl = getFrontendUrl();
    const team = await getPrimaryTeamForUser(req.user.id);

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    if (!canManageBilling(team, req.user.id)) {
      return res.status(403).json({ error: "Only the team owner can manage billing." });
    }

    let customerId = team.stripeCustomerId || req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name || undefined,
        metadata: {
          userId: req.user.id,
          teamId: team.id,
        },
      });

      customerId = customer.id;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user.id },
          data: { stripeCustomerId: customerId },
        }),
        prisma.team.update({
          where: { id: team.id },
          data: { stripeCustomerId: customerId },
        }),
      ]);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/dashboard?billing=success`,
      cancel_url: `${frontendUrl}/dashboard?billing=cancelled`,
      metadata: {
        userId: req.user.id,
        teamId: team.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: req.user.id,
          teamId: team.id,
          plan,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
}

async function createBillingPortalSession(req, res, next) {
  try {
    const stripe = getStripe();
    const frontendUrl = getFrontendUrl();
    const team = await getPrimaryTeamForUser(req.user.id);

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    if (!canManageBilling(team, req.user.id)) {
      return res.status(403).json({ error: "Only the team owner can manage billing." });
    }

    if (!team.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found for this team." });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: team.stripeCustomerId,
      return_url: `${frontendUrl}/dashboard`,
    });

    res.json({ url: portal.url });
  } catch (error) {
    next(error);
  }
}

async function handleStripeWebhook(req, res) {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).send("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const teamId = session.metadata?.teamId;
      const subscriptionId = session.subscription;
      const customerId = session.customer;

      if (teamId) {
        await prisma.team.update({
          where: { id: teamId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId || undefined,
            subscriptionStatus: "ACTIVE",
            plan: session.metadata?.plan || "pro",
            monthlyDocumentLimit: getLimitForPlan(session.metadata?.plan || "pro"),
          },
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object;
      const priceId = subscription.items?.data?.[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const teamId = subscription.metadata?.teamId;

      const statusMap = {
        trialing: "TRIALING",
        active: "ACTIVE",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        incomplete: "INCOMPLETE",
      };

      const data = {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        stripePriceId: priceId,
        subscriptionStatus: statusMap[subscription.status] || "INCOMPLETE",
        plan,
        monthlyDocumentLimit: getLimitForPlan(plan),
      };

      if (teamId) {
        await prisma.team.update({
          where: { id: teamId },
          data,
        });
      } else {
        await prisma.team.updateMany({
          where: { stripeCustomerId: subscription.customer },
          data,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;

      await prisma.team.updateMany({
        where: {
          OR: [
            { stripeSubscriptionId: subscription.id },
            { stripeCustomerId: subscription.customer },
          ],
        },
        data: {
          subscriptionStatus: "CANCELED",
          plan: "free",
          monthlyDocumentLimit: 5,
        },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    res.status(500).send("Webhook handler failed.");
  }
}

module.exports = {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
};
