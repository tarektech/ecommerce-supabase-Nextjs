# Polar Payment Integration Setup Guide

## Environment Variables Configuration

Add the following variables to your `.env.local` file:

```env
# Polar Payment Integration (Sandbox)
POLAR_ACCESS_TOKEN=polar_oat_xxxxxxxxxxxxx
NEXT_PUBLIC_POLAR_SERVER=sandbox
POLAR_WEBHOOK_SECRET=your-webhook-secret
POLAR_DEMO_PRODUCT_ID=your-polar-product-id-from-dashboard
```

### Getting Your Credentials

1. **POLAR_ACCESS_TOKEN** (Sandbox OAT)
   - Go to https://sandbox.polar.sh/dashboard
   - Navigate to Settings → Access Tokens
   - Create a new Organization Access Token (OAT)
   - Copy the token (starts with `polar_oat_`)

2. **POLAR_WEBHOOK_SECRET**
   - In Polar dashboard: Settings → Webhooks
   - Create a new webhook endpoint: `https://your-domain.com/api/polar/webhooks`
   - Select events: `checkout.completed`, `order.created`
   - Copy the webhook secret for signature verification

3. **NEXT_PUBLIC_POLAR_SERVER**
   - Use `sandbox` for testing
   - Change to `production` when going live

## Product Setup in Polar Sandbox

Create test products in Polar that match your Supabase products:

1. Go to https://sandbox.polar.sh/dashboard
2. Navigate to Products
3. Create products with:
   - Name matching your Supabase product titles
   - Price in cents (e.g., $10.00 = 1000)
   - Enable "Physical Product" for shipping
4. Note the Polar Product IDs for mapping

## Testing

Use Polar test cards for sandbox testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVV

## Production Checklist

Before going to production:
- [ ] Create Organization Access Token in production Polar dashboard
- [ ] Update `NEXT_PUBLIC_POLAR_SERVER=production`
- [ ] Configure production webhook endpoint
- [ ] Set up production webhook secret
- [ ] Create production products in Polar
- [ ] Test end-to-end flow in production

