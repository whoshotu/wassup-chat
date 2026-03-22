# Wassup - Payments Setup Guide

This guide explains how to configure Stripe payments and Supabase for the Wassup subscription system.

## Overview

Wassup uses:
- **Stripe** for payment processing and subscription management
- **Supabase** for authentication and database storage
- **Supabase Edge Functions** for Stripe webhook handling

## Environment Variables

Set these environment variables in your production environment:

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Supabase Edge Functions
Set these in your Supabase project dashboard under Edge Functions > Secrets:

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_WEEKLY=price_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
```

## Stripe Configuration

### 1. Create Products and Prices

In your Stripe Dashboard, create a product called "Wassup Pro" with three prices:

| Plan | Price | Billing |
|------|-------|---------|
| Pro Weekly | $9.99 | Weekly recurring |
| Pro Monthly | $19.99 | Monthly recurring |
| Pro Yearly | $79.99 | Yearly recurring |

Copy the price IDs (e.g., `price_1ABC...`) and set them as environment variables.

### 2. Configure Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and set as `STRIPE_WEBHOOK_SECRET`

### 3. Test Mode

For development, use Stripe test mode:
- Use `pk_test_xxx` and `sk_test_xxx` keys
- Test card: `4242 4242 4242 4242`

## Supabase Configuration

### 1. Run Database Migration

The migration file `supabase/migrations/20240101000001_subscriptions.sql` creates:
- `subscriptions` table - stores subscription status
- `usage_tracking` table - tracks daily decode usage
- `profiles` table - extends user profiles
- RLS policies for security
- Triggers for automatic profile creation

Run the migration:
```bash
supabase db push
```

### 2. Deploy Edge Functions

Deploy all Stripe-related edge functions:
```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
supabase functions deploy create-portal
```

### 3. Set Edge Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_WEEKLY=price_xxx
supabase secrets set STRIPE_PRICE_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_YEARLY=price_xxx
```

## How Plan Checks Work

### Client-Side (src/services/subscriptionService.ts)

1. **Usage Limits**: Free users get 5 decodes/day, tracked in localStorage
2. **Language Restrictions**: Free users limited to 5 languages
3. **History Limits**: Free users limited to 20 saved messages

### Server-Side (Supabase)

1. **Subscription Status**: Stored in `subscriptions` table
2. **Webhook Updates**: Stripe webhooks update subscription status automatically
3. **Usage Tracking**: `usage_tracking` table tracks daily usage (can be synced from client)

### Plan Check Flow

```
User clicks "Decode"
    ↓
Check subscription.planType
    ↓
If FREE:
    - Check daily usage limit (5/day)
    - Check language availability
    - Show upgrade prompt if limit reached
    ↓
If PRO:
    - Allow unlimited decodes
    - Allow all languages
```

## Subscription Flow

### New Subscription

1. User clicks "Upgrade" → redirected to Pricing page
2. User selects plan → calls `create-checkout` edge function
3. Edge function creates Stripe Checkout session
4. User completes payment on Stripe
5. Stripe sends `checkout.session.completed` webhook
6. Webhook handler updates `subscriptions` table
7. App reads updated subscription status

### Subscription Renewal

1. Stripe automatically charges at period end
2. `invoice.payment_succeeded` webhook fires
3. Subscription remains active

### Subscription Cancellation

1. User cancels in Stripe billing portal
2. `customer.subscription.updated` webhook fires (cancel_at_period_end = true)
3. At period end, `customer.subscription.deleted` webhook fires
4. Subscription reverts to free plan

## Testing Checklist

- [ ] Create Stripe test products and prices
- [ ] Set all environment variables
- [ ] Run database migration
- [ ] Deploy edge functions
- [ ] Test checkout flow with test card
- [ ] Verify webhook updates subscription
- [ ] Test usage limits for free users
- [ ] Test unlimited access for pro users
- [ ] Test subscription cancellation

## Security Notes

1. **Never expose secret keys** - Only use publishable key in frontend
2. **Verify webhooks** - Always verify Stripe webhook signatures
3. **Use RLS** - Row Level Security ensures users only see their own data
4. **Service role** - Only edge functions use service role key

## Support

For issues with:
- **Stripe**: Check Stripe Dashboard > Developers > Logs
- **Supabase**: Check Supabase Dashboard > Logs
- **Edge Functions**: Run `supabase functions logs stripe-webhook`
