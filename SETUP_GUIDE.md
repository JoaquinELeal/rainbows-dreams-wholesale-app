# Complete Wholesale System Setup Guide

This guide covers the complete setup of both the Shopify app and the theme integration for the wholesale system.

## Part 1: Shopify App Setup

### 1. Environment Configuration ✅ PARTIALLY COMPLETE

✅ **Shopify App Credentials**: Already configured
- Client ID: `b1b6cbd8ca25aeed3429ede3631985b7`
- Client Secret: `d6911e5bcce0ad5cb91c634177bd8882`

🔄 **Still Required**: Update the following in your `.env` file:

```bash
# Your development store URL
SHOP=your-development-store.myshopify.com

# SendGrid configuration (get from SendGrid dashboard)
SENDGRID_API_KEY=your_sendgrid_api_key
MERCHANT_EMAIL=your-email@example.com
FROM_EMAIL=noreply@yourdomain.com

# Generate a secure JWT secret
JWT_SECRET=your-secure-jwt-secret-here
```

### 2. App Proxy Setup

1. Go to Shopify Partners Dashboard
2. Select your app → App setup
3. Configure App proxy:
   - **Subpath**: `wholesale`
   - **Subpath prefix**: `apps`
   - **URL**: `https://your-app-url.ngrok.io/apps/wholesale`

This allows public access to `/apps/wholesale/register`

### 3. Shopify Function Deployment

Deploy the wholesale pricing function:

```bash
# Navigate to the pricing function
cd extensions/wholesale-pricing

# Install Javy (WebAssembly compiler)
# On macOS: brew install shopify/shopify/javy
# On Windows: Download from https://github.com/bytecodealliance/javy/releases

# Build the function
make build

# Deploy using Shopify CLI
cd ../..
npm run deploy
```

## Part 2: Theme Integration

### 1. Upload Theme Templates

Upload these templates to your Shopify theme:

1. **`templates/page.wholesale.liquid`**
   - Main wholesale portal page
   - Access control logic
   - Product display with tiered pricing

2. **`templates/page.wholesale-register.liquid`**
   - Public registration form
   - Business information collection
   - Terms and conditions

3. **`templates/page.wholesale-confirmation.liquid`**
   - Thank you page after registration
   - Next steps information

#### How to Upload:
1. Go to Shopify Admin → Online Store → Themes
2. Click "Actions" → "Edit code"
3. In Templates section, click "Add a new template"
4. Copy and paste each template file

### 2. Create Pages in Shopify Admin

Create these pages in **Online Store → Pages**:

1. **Wholesale Portal**
   - Title: "Wholesale Portal"
   - Handle: `wholesale`
   - Template: `page.wholesale`
   - Visibility: Visible

2. **Wholesale Registration**
   - Title: "Apply for Wholesale Access"
   - Handle: `wholesale-register`
   - Template: `page.wholesale-register`
   - Visibility: Visible

3. **Registration Confirmation**
   - Title: "Application Submitted"
   - Handle: `wholesale-confirmation`
   - Template: `page.wholesale-confirmation`
   - Visibility: Hidden

### 3. Create Wholesale Collection

1. Go to **Products → Collections**
2. Create new collection: "Wholesale"
3. Add products you want to offer to wholesale customers
4. The collection handle should be `wholesale`

### 4. Configure Navigation (Optional)

Add wholesale link to your store navigation:
1. **Online Store → Navigation**
2. Add menu item linking to `/pages/wholesale-register`

## Part 3: Shopify Function Configuration

### 1. Enable the Pricing Function

After deploying the function:

1. Go to **Settings → Checkout**
2. Find your wholesale pricing function
3. Enable it for wholesale customers

### 2. Function Logic

The function automatically applies discounts based on quantity:
- 10-49 units: 10% off
- 50-199 units: 15% off
- 200+ units: 20% off

Only applies to customers with the `wholesale` tag.

## Part 4: Testing Workflow

### 1. Registration Test

1. Visit `/pages/wholesale-register`
2. Fill out the registration form
3. Submit application
4. Check merchant email for notification
5. Verify customer created in Shopify Admin

### 2. Approval Test

1. Click approve/reject links in merchant email
2. Verify customer tags updated in Shopify
3. Check customer email for notification
4. Test login to wholesale portal

### 3. Pricing Test

1. Login as approved wholesale customer
2. Visit `/pages/wholesale`
3. Add products with different quantities
4. Verify discounts applied in cart

## Part 5: Shopify Flow Integration (Optional)

### 1. Create Flow Automation

1. Go to **Apps → Flow**
2. Create new Flow
3. Trigger: Customer tag added/removed
4. Condition: Tag equals "wholesale"
5. Action: Send notification or other automation

### 2. Example Flow Uses

- Send Slack notifications for new approvals
- Add customers to mailing lists
- Create follow-up tasks
- Update external CRM systems

## Part 6: Production Deployment

### 1. App Deployment

Deploy to Vercel:
```bash
# Connect to Vercel
vercel

# Configure environment variables in Vercel dashboard
# Deploy
vercel --prod
```

### 2. Update App Proxy URL

Update the app proxy URL in Shopify Partners to your production URL.

### 3. SendGrid Configuration

1. Verify sender domain in SendGrid
2. Set up dedicated IP (optional)
3. Configure email templates
4. Test email delivery

### 4. Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong SendGrid API key permissions
- [ ] Enable HTTPS
- [ ] Test email delivery
- [ ] Verify customer data protection

## Part 7: Maintenance & Monitoring

### 1. Regular Tasks

- Monitor registration volume
- Check email delivery rates
- Review approval/rejection ratios
- Update pricing tiers as needed

### 2. Analytics

Track these metrics:
- Registration conversion rate
- Approval rate
- Wholesale customer lifetime value
- Average order size by tier

### 3. Customer Support

Set up support processes for:
- Registration questions
- Login issues
- Pricing inquiries
- Technical problems

## Troubleshooting

### Common Issues

1. **App Proxy Not Working**
   - Check URL configuration
   - Verify app is published
   - Test endpoint directly

2. **Emails Not Sending**
   - Verify SendGrid API key
   - Check sender verification
   - Review email logs

3. **Pricing Not Applied**
   - Verify function deployment
   - Check customer tags
   - Test with different quantities

4. **Theme Templates Not Working**
   - Check liquid syntax
   - Verify page handles
   - Test customer login status

### Support Resources

- Shopify App Development Docs
- SendGrid API Documentation
- Shopify Functions Guide
- Liquid Template Reference

This comprehensive setup creates a complete wholesale system using native Shopify features with minimal custom code, exactly as specified in your requirements!
