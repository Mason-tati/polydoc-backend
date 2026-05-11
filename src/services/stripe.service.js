const Stripe = require("stripe");

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || "https://translatemanual-frontend-production.up.railway.app";
}

function getPriceId(plan) {
  const selectedPlan = (plan || "pro").toLowerCase();

  if (selectedPlan === "business") {
    return process.env.STRIPE_PRICE_BUSINESS;
  }

  return process.env.STRIPE_PRICE_PRO;
}

function getPlanFromPriceId(priceId) {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return "custom";
}

function getLimitForPlan(plan) {
  if (plan === "business") return 500;
  if (plan === "pro") return 100;
  return 5;
}

module.exports = {
  getStripe,
  getFrontendUrl,
  getPriceId,
  getPlanFromPriceId,
  getLimitForPlan,
};
