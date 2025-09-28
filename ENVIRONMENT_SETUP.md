# Environment Variables Checklist

## Required Environment Variables

### 1. DATABASE_URL
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://user:pass@localhost:5432/callready`
- **Common Issues**:
  - Missing `postgresql://` prefix
  - Incorrect credentials
  - Wrong port (should be 5432 for PostgreSQL)
  - Database doesn't exist

### 2. NEXTAUTH_SECRET
- **Format**: Random string (32+ characters recommended)
- **Generate**: `openssl rand -base64 32`
- **Example**: `your-super-secret-key-here-32-chars-min`
- **Common Issues**:
  - Too short (< 32 characters)
  - Contains special characters that break
  - Not set at all

### 3. NEXTAUTH_URL
- **Format**: Your app's URL
- **Example**: `https://callready-ai.vercel.app`
- **Common Issues**:
  - Missing `https://`
  - Wrong domain
  - Trailing slash issues

### 4. OPENAI_API_KEY
- **Format**: `sk-...` (OpenAI API key)
- **Get from**: https://platform.openai.com/api-keys
- **Common Issues**:
  - Missing `sk-` prefix
  - Expired or invalid key
  - Insufficient credits

## Optional Environment Variables

### Google OAuth (for Google login)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

### Email (for sending briefs)
- `RESEND_API_KEY`: From Resend.com

## Vercel Setup Steps

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable with the correct value
3. Make sure "Production" environment is selected
4. Redeploy the project

## Testing

Visit `/test` to see if basic app works
Visit `/api/debug` to check environment variable status

