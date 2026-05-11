# TranslateManual.ai Backend — Phase 5B Teams + Stripe Billing

Phase 5B adds:

- Team records
- Team owner/member structure
- Stripe customer creation
- Stripe subscription Checkout
- Stripe Billing Portal
- Stripe webhooks to update subscription status
- Free/pro/business plan tracking

## New APIs

### Get current team

GET `/api/teams/me`

Header:

```text
Authorization: Bearer TOKEN
```

### Rename team

PATCH `/api/teams/me`

```json
{
  "name": "My Company"
}
```

### Create Stripe Checkout session

POST `/api/billing/checkout`

```json
{
  "plan": "pro"
}
```

or

```json
{
  "plan": "business"
}
```

Response:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### Create Billing Portal session

POST `/api/billing/portal`

Response:

```json
{
  "url": "https://billing.stripe.com/..."
}
```

### Stripe webhook

POST `/api/billing/webhook`

## Required Railway backend variables

```env
STRIPE_SECRET_KEY=sk_test_or_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx
FRONTEND_URL=https://translatemanual-frontend-production.up.railway.app
```

Keep existing:

```env
DATABASE_URL=...
JWT_SECRET=...
OPENAI_API_KEY=...
NODE_ENV=production
```

## Stripe Dashboard setup

1. Create Stripe account
2. Create Product: TranslateManual.ai Pro
3. Create recurring monthly Price
4. Copy Price ID to `STRIPE_PRICE_PRO`
5. Create Product: TranslateManual.ai Business
6. Create recurring monthly Price
7. Copy Price ID to `STRIPE_PRICE_BUSINESS`
8. Add webhook endpoint:
   `https://polydoc-backend-production.up.railway.app/api/billing/webhook`
9. Listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
10. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Deploy

1. Copy into `polydoc-backend`
2. Commit: `Add Phase 5B teams and Stripe billing`
3. Push origin
4. Railway redeploys backend
