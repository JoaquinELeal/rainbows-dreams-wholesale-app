# Setup Scripts for Wholesale Registration App

This directory contains setup scripts to quickly configure your Shopify wholesale registration and approval system.

## Quick Start

### For Unix/Linux/macOS users:
```bash
chmod +x setup.sh
./setup.sh
```

### For Windows users:
```cmd
setup.bat
```

## What the setup scripts do:

### 📦 Dependencies Installation
- **@sendgrid/mail** - Email notification service
- **jsonwebtoken** - Secure token generation for approval links
- **bcryptjs** - Password hashing utilities
- **@types/jsonwebtoken** & **@types/bcryptjs** - TypeScript definitions

### 🔧 Environment Configuration
- Creates `.env` file with all required environment variables
- Generates secure JWT secret
- Sets up database connection string

### 🗄️ Database Setup
- Generates Prisma client
- Runs database migrations
- Creates necessary tables for wholesale registrations

### 📁 Project Structure
- Creates required directories (`app/services`, `app/utils`, etc.)
- Sets up email templates directory
- Prepares theme integration files

### 📧 Email Templates
- **merchant-notification.html** - Email template for notifying merchants of new applications
- Includes approve/reject action buttons
- Professional HTML formatting

### 🔒 Security Setup
- Generates secure JWT secrets
- Sets up proper environment variable isolation
- Configures secure token handling

### 🧪 Testing Environment
- Installs Vitest for testing
- Sets up React Testing Library
- Configures test scripts

## After Running Setup

1. **Edit `.env` file** with your actual credentials:
   - Shopify API key and secret
   - SendGrid API key
   - Your store domain
   - Merchant email address

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access your app** via the ngrok URL provided

4. **Set up app proxy** in Shopify Partners dashboard

## Available Scripts (Added by Setup)

- `npm run wholesale:setup` - Initialize/reinitialize database
- `npm run wholesale:reset` - Reset database (deletes all data)
- `npm run wholesale:studio` - Open Prisma Studio for database management
- `npm run test` - Run test suite
- `npm run test:ui` - Run tests with UI

## Troubleshooting

### Script Permission Issues (Unix/Linux/macOS)
```bash
chmod +x setup.sh
```

### Node.js Not Found
Make sure Node.js 18+ is installed:
```bash
node --version
npm --version
```

### Shopify CLI Issues
The script will attempt to install Shopify CLI globally. If this fails:
```bash
npm install -g @shopify/cli @shopify/theme
```

### Database Issues
If database setup fails, manually run:
```bash
npx prisma generate
npx prisma db push
```

## What's Created

```
project-root/
├── .env                          # Environment variables
├── .env.local                    # Local JWT secret
├── email-templates/              # Email templates
│   └── merchant-notification.html
├── theme-files/                  # Shopify theme integration
│   └── templates/
│       └── page.wholesale.liquid
└── WHOLESALE_SETUP.md           # Setup documentation
```

## Next Steps

1. Configure your environment variables
2. Test the registration flow
3. Set up app proxy in Shopify
4. Deploy to production

For detailed setup instructions, see `SETUP_GUIDE.md` and `WHOLESALE_README.md`.
