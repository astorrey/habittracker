# Supabase Setup Instructions

## Database Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Run the SQL commands from `schema.sql` to create all tables, indexes, and RLS policies

## Google OAuth Setup

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
4. Add authorized redirect URLs:
   - For development: `exp://localhost:8081`
   - For production: Your app's redirect URI

## Environment Variables

After setting up Supabase, you'll need to add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

You can find these values in your Supabase project settings:
- Project URL: Settings > API > Project URL
- Anon Key: Settings > API > anon/public key
- Google Client ID: From Google Cloud Console

## Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Create OAuth client ID for iOS/Android (or Web application for development)
7. Add authorized redirect URIs from Supabase

