# Create Pro Account Instructions

## Account Details
- **Email**: shuchi831@gmail.com
- **Password**: Brayden.Aria.2020
- **Plan**: Pro (200 briefs limit)
- **Status**: Active (paid for 1 year)

## Method 1: Call API Endpoint (Recommended)

Once the application is deployed to Vercel, call the API endpoint:

```bash
curl -X POST https://callreadyai.com/api/admin/create-pro-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shuchi831@gmail.com",
    "password": "Brayden.Aria.2020",
    "name": "Shuchi"
  }'
```

Or use any HTTP client (Postman, Insomnia, etc.) to make a POST request to:
- **URL**: `https://callreadyai.com/api/admin/create-pro-account`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "email": "shuchi831@gmail.com",
  "password": "Brayden.Aria.2020",
  "name": "Shuchi"
}
```

## Method 2: Local Development

If running locally:

```bash
curl -X POST http://localhost:3000/api/admin/create-pro-account \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shuchi831@gmail.com",
    "password": "Brayden.Aria.2020",
    "name": "Shuchi"
  }'
```

## What This Does

1. Creates the user account in the database (if database is available)
2. Creates the user in the in-memory authentication store (required for login)
3. Sets up a Pro subscription with:
   - Plan: "pro"
   - Status: "active"
   - Briefs Limit: 200
   - Subscription Period: 1 year from creation date
4. Returns confirmation with user details

## Verification

After creating the account, the user can:
1. Go to the login page
2. Login with:
   - Email: shuchi831@gmail.com
   - Password: Brayden.Aria.2020
3. Access the dashboard with Pro plan features
4. See 200 briefs available in their account

## Security Note

⚠️ **Important**: This admin endpoint should be secured in production. Consider adding:
- Admin authentication
- API key protection
- IP whitelisting
- Or remove the endpoint after account creation



