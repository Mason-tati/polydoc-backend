const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
} = require("../controllers/billing.controller");

const router = express.Router();

router.post("/checkout", requireAuth, createCheckoutSession);
router.post("/portal", requireAuth, createBillingPortalSession);
router.post("/webhook", handleStripeWebhook);

module.exports = router;
