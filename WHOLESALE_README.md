# Wholesale Registration System

This Shopify app implements a complete wholesale customer registration and approval system based on the specification in `spec_registration_approval.md`.

## Features

### Core Functionality
- ✅ **Customer Registration Form** (`/wholesale/register`)
  - Collects name, email, and business details
  - Creates Shopify customer with `wholesale_pending` tag
  - Stores detailed registration in local database

- ✅ **Email Notification System**
  - Sends merchant notification emails with approve/reject buttons
  - Sends customer confirmation emails on approval/rejection
  - Uses SendGrid for reliable email delivery

- ✅ **Approval/Rejection Workflow**
  - Secure token-based approval links (7-day expiration)
  - Updates Shopify customer tags (`wholesale` or `wholesale_rejected`)
  - Triggers Shopify Flow events for downstream automation

- ✅ **Admin Dashboard** (`/app/wholesale/dashboard`)
  - View registration statistics
  - Monitor pending applications
  - Track approval/rejection rates

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   Shopify App   │    │   Shopify API   │
│                 │    │                 │    │                 │
│ Registration    ├────┤ Remix Routes    ├────┤ GraphQL Admin   │
│ Form            │    │ Service Layer   │    │ API             │
│                 │    │ Database        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │   SendGrid      │
                       │   Email API     │
                       │                 │
                       └─────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Copy the environment template and configure your credentials:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=read_customers,write_customers,read_orders,write_orders
SHOPIFY_APP_URL=https://your-app-url.ngrok.io
SHOP=your-development-store.myshopify.com

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
MERCHANT_EMAIL=merchant@example.com
FROM_EMAIL=noreply@example.com

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 2. Database Setup

The app uses SQLite with Prisma. Run the migrations:

```bash
npm run setup
```

### 3. Run the Application

Start the development server:

```bash
npm run dev
```

## Usage

### For Customers

1. Visit `/wholesale/register` to submit a wholesale application
2. Fill out the registration form with business details
3. Receive confirmation of submission
4. Wait for email notification of approval/rejection

### For Merchants

1. Receive email notifications for new applications
2. Click "Approve" or "Reject" buttons in emails
3. View dashboard at `/app/wholesale/dashboard` for statistics
4. Customers are automatically notified of decisions

## API Endpoints

- `GET /wholesale/register` - Registration form
- `POST /wholesale/register` - Submit registration
- `GET /api/approve?token=...` - Approve application
- `GET /api/reject?token=...` - Reject application
- `GET /app/wholesale/dashboard` - Admin dashboard

## Database Schema

```sql
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_customer_id VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_details TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Email Templates

The app includes responsive HTML email templates for:

- **Merchant Notifications**: New application alerts with action buttons
- **Customer Approval**: Welcome and next steps
- **Customer Rejection**: Polite rejection with alternative options

## Security Features

- JWT tokens for secure approval/rejection links
- 7-day token expiration
- Input validation and sanitization
- SQL injection protection via Prisma

## Shopify Integration

- Creates customers via GraphQL Admin API
- Uses customer tags for status management
- Stores business details in customer metafields
- Triggers Shopify Flow events for automation

## Deployment

The app is designed for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

## Testing

Test the complete workflow:

1. Submit a test registration
2. Check email notifications
3. Use approval/rejection links
4. Verify customer status in Shopify admin
5. Check dashboard statistics

## Next Steps

- [ ] Add CAPTCHA protection
- [ ] Implement custom email templates
- [ ] Add automatic approval rules
- [ ] Create webhook endpoints for real-time updates
- [ ] Add audit logging

## Support

For questions or issues, contact the development team or refer to the original specification document.
