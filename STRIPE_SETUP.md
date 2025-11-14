# Stripe Payment Setup Guide

## Current Issue

You're getting a "Failed to create payment intent" error because you're using **live Stripe keys** in development mode.

## Solution

### 1. Get Test Keys from Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/apikeys
2. Make sure you're in **Test mode** (toggle in top right)
3. Copy your keys:
    - **Secret key** (starts with `sk_test_...`)
    - **Publishable key** (starts with `pk_test_...`)

### 2. Update .env File

Replace the current live keys with test keys:

```bash
# Replace these lines in .env:
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
```

### 3. Restart the Server

After updating .env, restart your development server:

```bash
npm run dev
```

## Key Differences

### Test Keys (`sk_test_...` / `pk_test_...`)

-   ✅ For development and testing
-   ✅ No real money transactions
-   ✅ Use test card numbers like `4242 4242 4242 4242`
-   ✅ More lenient validation

### Live Keys (`sk_live_...` / `pk_live_...`)

-   ⚠️ For production only
-   ⚠️ Real money transactions
-   ⚠️ Strict validation and requirements
-   ⚠️ Can fail in development due to incomplete setup

## Test Payment

Once you have test keys, use these test card numbers:

-   Success: `4242 4242 4242 4242`
-   Decline: `4000 0000 0000 0002`
-   Any future expiry date (e.g., 12/25)
-   Any 3-digit CVC (e.g., 123)
-   Any ZIP code (e.g., 12345)

## Production Deployment

When deploying to production (Coolify), use your live keys in the production environment variables.
