# Shopify App Setup Checklist

## ✅ Completed
- [x] **Shopify App Credentials Configured**
  - Client ID: `b1b6cbd8ca25aeed3429ede3631985b7`
  - Client Secret: `d6911e5bcce0ad5cb91c634177bd8882`
  - Scopes: `read_customers,write_customers,read_orders,write_orders,read_products,write_products`

## 🔄 Next Steps Required

### 1. Development Store Setup
You need to update the `.env` file with your development store URL:
```bash
SHOP=your-development-store.myshopify.com
```
Replace `your-development-store` with your actual Shopify development store name.

### 2. SendGrid Email Configuration
Sign up for SendGrid and get your API key:
1. Go to [SendGrid.com](https://sendgrid.com) and create a free account
2. Generate an API key in SendGrid dashboard
3. Update `.env` file:
   ```bash
   SENDGRID_API_KEY=your_actual_sendgrid_api_key
   MERCHANT_EMAIL=your-email@example.com
   FROM_EMAIL=noreply@yourdomain.com
   ```

### 3. JWT Secret
Generate a secure JWT secret for production:
```bash
JWT_SECRET=a-very-long-random-string-for-security
```

### 4. Database Setup
Run the database migrations:
```bash
npm run setup
```

### 5. Start Development Server
Start the app with:
```bash
npm run dev
```

### 6. Install App on Development Store
When the dev server starts, it will provide an ngrok URL. Use this to install the app on your development store.

### 7. Configure App Proxy (After Installation)
In your Shopify Partner dashboard:
1. Go to your app settings
2. Set up App Proxy:
   - Subpath prefix: `apps`
   - Subpath: `wholesale`
   - URL: `https://your-ngrok-url.ngrok.io/apps/wholesale`

### 8. Deploy Shopify Function
After the app is working locally:
```bash
npm run deploy
```

## 🔒 Security Notes
- **Never commit the `.env` file** to version control
- **Change JWT_SECRET** for production deployment
- **Use environment variables** for all sensitive data in production

## 📞 Support
If you encounter any issues, check the detailed setup guide in `SETUP_GUIDE.md`.
