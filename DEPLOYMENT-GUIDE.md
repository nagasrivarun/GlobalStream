# GlobalStream Deployment Guide

## Environment Variables

Your GlobalStream application requires these environment variables:

\`\`\`env
# TMDB API Key - COMPLETE ✅
TMDB_API_KEY=3532931b20a2cd8c67e7c32eb7c3e546

# Supabase Database - COMPLETE ✅
NEXT_PUBLIC_SUPABASE_URL=https://rtaofvqxfkddhahelnqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YW9mdnF4ZmtkZGhhaGVsbnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDg2OTksImV4cCI6MjA1OTA4NDY5OX0.xKI2VsXE-G_NTPXkVdEy8yIJnOZaZmwX7br-s4tIDmE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0YW9mdnF4ZmtkZGhhaGVsbnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUwODY5OSwiZXhwIjoyMDU5MDg0Njk5fQ.Z0VyOxgnoErUhD_nb705ID26nF6D53LueTqrCnuF_lw

# Authentication - STILL NEEDED
NEXTAUTH_SECRET=GlobalStream-Secret-Key-2024-Very-Secure-32-Chars
NEXTAUTH_URL=https://your-domain.com  # Change in production

# Google OAuth - STILL NEEDED
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com  # Change in production
\`\`\`

## Remaining Setup

### 1. NextAuth Secret
Generate a secure random string:
\`\`\`bash
openssl rand -base64 32
\`\`\`
Or use the provided placeholder for development.

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth client ID
5. Application type: Web application
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`

## Deployment Steps

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect to Vercel
3. Add all environment variables
4. Deploy!

### Manual Deployment
1. Build your application:
\`\`\`bash
npm run build
\`\`\`
2. Start the server:
\`\`\`bash
npm start
\`\`\`

## Post-Deployment
1. Update `NEXTAUTH_URL` to your production URL
2. Update `NEXT_PUBLIC_APP_URL` to your production URL
3. Add production redirect URI to Google OAuth
