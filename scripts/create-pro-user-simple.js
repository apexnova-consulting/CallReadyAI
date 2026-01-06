/**
 * Simple script to create Pro account user
 * This adds the user to the in-memory store which is used for authentication
 * Run this after the server starts, or call the API endpoint
 */

// This script demonstrates how to call the API
// In production, you would call: POST /api/admin/create-pro-account
// With body: { email: "shuchi831@gmail.com", password: "Brayden.Aria.2020", name: "Shuchi" }

console.log(`
To create the Pro account, you have two options:

1. Call the API endpoint (recommended):
   curl -X POST https://your-domain.com/api/admin/create-pro-account \\
     -H "Content-Type: application/json" \\
     -d '{
       "email": "shuchi831@gmail.com",
       "password": "Brayden.Aria.2020",
       "name": "Shuchi"
     }'

2. Or use the API route after deployment:
   POST /api/admin/create-pro-account
   Body: {
     "email": "shuchi831@gmail.com",
     "password": "Brayden.Aria.2020",
     "name": "Shuchi"
   }

The account will be created with:
- Email: shuchi831@gmail.com
- Password: Brayden.Aria.2020
- Plan: Pro (200 briefs limit)
- Status: Active
- Subscription period: 1 year from creation
`)



