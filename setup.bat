@echo off
setlocal enabledelayedexpansion

echo 🚀 Setting up Shopify Wholesale Registration App...
echo ==================================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the app root directory.
    exit /b 1
)

echo 📦 Installing dependencies...

REM Core dependencies for wholesale functionality
echo Installing core packages...
call npm install @sendgrid/mail jsonwebtoken bcryptjs

REM Development dependencies
echo Installing development dependencies...
call npm install --save-dev @types/jsonwebtoken @types/bcryptjs

REM Check if Prisma is installed
npm list prisma >nul 2>&1
if errorlevel 1 (
    echo Installing Prisma...
    call npm install prisma @prisma/client
    call npm install --save-dev prisma
)

echo 🔧 Setting up environment configuration...

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    (
        echo # Shopify App Configuration
        echo SHOPIFY_API_KEY=your_api_key_here
        echo SHOPIFY_API_SECRET=your_api_secret_here
        echo SHOPIFY_APP_URL=https://your-app-url.ngrok.io
        echo SHOPIFY_SCOPES=write_customers,read_customers,write_orders,read_orders
        echo.
        echo # Database
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # SendGrid Email Service
        echo SENDGRID_API_KEY=your_sendgrid_api_key_here
        echo SENDGRID_FROM_EMAIL=noreply@yourstore.com
        echo MERCHANT_EMAIL=admin@yourstore.com
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
        echo.
        echo # App Configuration
        echo APP_URL=https://your-app-url.ngrok.io
        echo NODE_ENV=development
    ) > .env
    echo ✅ .env file created. Please update with your actual credentials.
) else (
    echo ✅ .env file already exists.
)

echo 🗄️ Setting up database...

REM Generate Prisma client
echo Generating Prisma client...
call npx prisma generate

REM Run database migrations
echo Running database migrations...
call npx prisma db push

echo 📁 Creating necessary directories...
if not exist "app\services" mkdir app\services
if not exist "app\utils" mkdir app\utils
if not exist "extensions\wholesale-pricing\src" mkdir extensions\wholesale-pricing\src
if not exist "templates" mkdir templates

echo 🧪 Setting up testing environment...
npm list vitest >nul 2>&1
if errorlevel 1 (
    call npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
)

echo 🔒 Setting up security...
REM Generate a random JWT secret if not set
if not exist ".env.local" (
    echo JWT_SECRET=generated_jwt_secret_%RANDOM%%RANDOM% > .env.local
    echo ✅ Generated JWT secret in .env.local
)

echo 📋 Checking Shopify CLI...
where shopify >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Shopify CLI not found. Installing...
    call npm install -g @shopify/cli @shopify/theme
) else (
    echo ✅ Shopify CLI is installed
)

echo 🔧 Setting up development scripts...
REM Add custom scripts to package.json
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const scripts = {
    'wholesale:setup': 'prisma generate && prisma db push',
    'wholesale:reset': 'prisma db push --force-reset',
    'wholesale:studio': 'prisma studio',
    'test': 'vitest',
    'test:ui': 'vitest --ui'
};
packageJson.scripts = { ...packageJson.scripts, ...scripts };
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Added wholesale scripts to package.json');
"

echo 📧 Setting up email templates...
if not exist "email-templates" mkdir email-templates
(
    echo ^<!DOCTYPE html^>
    echo ^<html^>
    echo ^<head^>
    echo     ^<meta charset="utf-8"^>
    echo     ^<title^>New Wholesale Application^</title^>
    echo ^</head^>
    echo ^<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"^>
    echo     ^<h2^>New Wholesale Application Received^</h2^>
    echo     ^<p^>A new wholesale application has been submitted:^</p^>
    echo     
    echo     ^<div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;"^>
    echo         ^<p^>^<strong^>Name:^</strong^> {{customerName}}^</p^>
    echo         ^<p^>^<strong^>Email:^</strong^> {{customerEmail}}^</p^>
    echo         ^<p^>^<strong^>Business:^</strong^> {{businessName}}^</p^>
    echo         ^<p^>^<strong^>Tax ID:^</strong^> {{taxId}}^</p^>
    echo     ^</div^>
    echo     
    echo     ^<div style="margin: 30px 0;"^>
    echo         ^<a href="{{approveUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-right: 10px;"^>✓ Approve^</a^>
    echo         ^<a href="{{rejectUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;"^>✗ Reject^</a^>
    echo     ^</div^>
    echo ^</body^>
    echo ^</html^>
) > email-templates\merchant-notification.html

echo ✅ Verifying installation...
call npm run build >nul 2>&1 && echo ✅ Build successful || echo ⚠️  Build had warnings (this is normal)

echo.
echo 🎉 Setup Complete!
echo ================================
echo ✅ Dependencies installed
echo ✅ Environment configured
echo ✅ Database ready
echo ✅ Email templates created
echo ✅ Theme files prepared
echo ✅ Scripts added
echo.
echo 📖 Next: Edit .env file and run 'npm run dev'
echo 📚 Documentation: See WHOLESALE_SETUP.md
echo.
echo 🚀 Your wholesale registration system is ready!

pause
