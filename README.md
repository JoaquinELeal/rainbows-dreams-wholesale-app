# Wholesale Shopify App

A custom Shopify app to handle wholesale customer registration, approval workflows, and tiered volume-based discounts—built with Node.js, Express, and Shopify Functions, deployed on Vercel.

## Table of Contents

* [Features](#features)
* [Prerequisites](#prerequisites)
* [Environment Variables](#environment-variables)
* [Installation & Configuration](#installation--configuration)

  * [Shopify App Setup](#shopify-app-setup)
  * [App Proxy](#app-proxy)
* [Running Locally](#running-locally)
* [Deployment](#deployment)
* [Usage](#usage)
* [Testing](#testing)
* [Contributing](#contributing)
* [License](#license)

## Features

* Custom registration form for wholesale applicants
* Admin dashboard for approving or rejecting customers
* Automated email notifications via SendGrid
* Access-controlled wholesale storefront page
* Tiered discount logic (10–49: 10%, 50–199: 15%, 200+: 20%) via Shopify Functions

## Prerequisites

* Node.js (v18 or higher)
* Yarn or npm
* A Shopify Partner account and development store
* Vercel account for deployment
* SendGrid API key (or equivalent email provider)

## Environment Variables

Create a `.env` file or set these in Vercel:

```bash
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SCOPES=read_customers,write_customers,read_orders,write_orders
SENDGRID_API_KEY=your_sendgrid_api_key
MERCHANT_EMAIL=your_merchant_email
FROM_EMAIL=your_from_email
JWT_SECRET=your_production_jwt_secret
DATABASE_URL=your_production_database_url
```

## Installation & Configuration

### Shopify App Setup

1. In your Shopify Admin, go to **Apps > Develop apps** and **Create app**.
2. Set the **App URL** to your Vercel deployment (e.g. `https://your-app.vercel.app`).
3. Configure **Redirect URLs** (OAuth callback, e.g. `https://your-app.vercel.app/api/auth/callback`).
4. Grant API scopes: `read_customers`, `write_customers`, `read_orders`, `write_orders`.
5. Install the app on your development store and accept permissions.

### App Proxy

Use Shopify’s App Proxy to expose the registration form on your storefront:

1. Under **App proxy**, set:

   * **Subpath prefix**: `wholesale`
   * **Subpath**: `register`
2. Requests to `/apps/wholesale/register` will route to `https://your-app.vercel.app/api/register`.

## Running Locally

1. Clone the repo:

   ```bash
   ```

git clone [https://github.com/your-org/wholesale-app.git](https://github.com/your-org/wholesale-app.git)
cd wholesale-app

````
2. Install dependencies:
```bash
npm install
# or yarn install
````

3. Copy `.env.example` to `.env` and fill in your credentials.
4. Start development server:

   ```bash
   ```

npm run dev

# or yarn dev

````
5. Tunnel your local server with `vercel dev` (supports App Proxy routing).

## Deployment

1. Push your code to GitHub.
2. In Vercel, import the project and link to your repo.
3. Add the environment variables under **Settings → Environment Variables**.
4. Deploy using the Vercel dashboard or CLI:
```bash
vercel --prod
````

## Usage

* **Registration**: Customers visit `/apps/wholesale/register` to apply.
* **Admin Dashboard**: Visit your app’s URL (e.g. `https://your-app.vercel.app/app/dashboard`) to view pending applicants.
* **Approval**: Click **Approve** or **Reject** to update customer tags and send email notifications.
* **Wholesale Page**: Approved users log in to view `/wholesale` page with tiered prices.

## Testing

* **Shopify Function**: Test locally with Shopify CLI:

  ```bash
  ```

shopify extension run --path=functions/tiered-discount/build/function.wasm --input tests/sample-input.json

```
- **API Endpoints**: Use tools like Postman to hit `/api/register`, `/api/approve`, `/api/reject` with test payloads.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and add tests.
4. Submit a pull request describing your changes.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

```
