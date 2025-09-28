# CallReady AI 2.0 Environment Setup

This document outlines all the environment variables required to run CallReady AI 2.0 in production with all new features.

## Required Environment Variables

### Core Application
```bash
# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000  # Your app URL
NEXTAUTH_SECRET=your-secret-key-here  # Random string for NextAuth

# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/callready_ai

# AI Service
GEMINI_API_KEY=your-gemini-api-key-here  # Google Gemini API key

# Email Service
RESEND_API_KEY=your-resend-api-key-here  # Resend API key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...  # Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...  # Stripe webhook secret

# Buyer Intent Signals APIs
RAPIDAPI_KEY=your-rapidapi-key-here  # RapidAPI key for external data
CLEARBIT_API_KEY=your-clearbit-key-here  # Clearbit API key
NEWS_API_KEY=your-news-api-key-here  # News API key

# CRM Integrations (Optional)
HUBSPOT_API_KEY=your-hubspot-key-here  # HubSpot API key
SALESFORCE_CLIENT_ID=your-salesforce-client-id  # Salesforce OAuth
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret  # Salesforce OAuth
PIPEDRIVE_API_TOKEN=your-pipedrive-token-here  # Pipedrive API token

# Error Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn-here  # Sentry error tracking
```

## Setup Instructions

### 1. Database Setup
1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run database migrations: `npx prisma migrate deploy`

### 2. AI Service Setup
1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set the `GEMINI_API_KEY` environment variable

### 3. Email Service Setup
1. Sign up for [Resend](https://resend.com/)
2. Create an API key
3. Set the `RESEND_API_KEY` environment variable

### 4. Payment Setup
1. Create a [Stripe](https://stripe.com/) account
2. Get your API keys from the Stripe dashboard
3. Set up webhook endpoints for subscription events
4. Set the Stripe environment variables

### 5. Buyer Intent Signals Setup
1. Sign up for [RapidAPI](https://rapidapi.com/) and subscribe to:
   - Crunchbase API (company funding data)
   - LinkedIn Jobs Scraper API (hiring data)
   - BuiltWith API (tech stack data)
2. Get a [Clearbit](https://clearbit.com/) API key for company data
3. Get a [News API](https://newsapi.org/) key for company news
4. Set the respective environment variables

### 6. CRM Integrations Setup (Optional)
1. **HubSpot**: Create a private app and get API key
2. **Salesforce**: Set up OAuth app and get client credentials
3. **Pipedrive**: Generate API token from account settings
4. Set the respective environment variables

### 7. Error Monitoring (Optional)
1. Sign up for [Sentry](https://sentry.io/)
2. Create a project and get your DSN
3. Set the `SENTRY_DSN` environment variable

## Production Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variable Checklist
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `NEXTAUTH_SECRET` - Random secret string
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `RAPIDAPI_KEY` - RapidAPI key for buyer intent signals
- [ ] `CLEARBIT_API_KEY` - Clearbit API key
- [ ] `NEWS_API_KEY` - News API key
- [ ] `HUBSPOT_API_KEY` - HubSpot API key (optional)
- [ ] `SALESFORCE_CLIENT_ID` - Salesforce client ID (optional)
- [ ] `SALESFORCE_CLIENT_SECRET` - Salesforce client secret (optional)
- [ ] `PIPEDRIVE_API_TOKEN` - Pipedrive API token (optional)
- [ ] `SENTRY_DSN` - Sentry DSN (optional)

## API Cost Estimates

### Buyer Intent Signals APIs
- **RapidAPI**: ~$50-100/month for moderate usage
- **Clearbit**: ~$99/month for company data
- **News API**: ~$449/month for business plan

### CRM Integrations
- **HubSpot**: Free tier available, paid plans start at $45/month
- **Salesforce**: Free tier available, paid plans start at $25/user/month
- **Pipedrive**: Free tier available, paid plans start at $14.90/user/month

## Security Notes
- Never commit environment variables to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor API usage and costs
- Set up rate limiting for external API calls
- Implement proper error handling for API failures
