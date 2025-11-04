# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the SQL from `supabase/schema.sql`
3. Go to Authentication > Providers and enable Google OAuth
4. Get your credentials:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > anon/public key

## Step 3: Set Up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application (for development)
   - Authorized redirect URIs: Add your Supabase redirect URI
5. Copy the Client ID

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 5: Run the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
src/
├── components/       # Reusable components
├── hooks/           # Custom React hooks
├── navigation/      # Navigation setup
├── screens/         # Screen components
├── services/        # API service functions
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Key Features

- ✅ Google OAuth authentication
- ✅ Multi-team support
- ✅ Player management
- ✅ Live game scoring
- ✅ Statistics tracking (batting averages, RBIs, etc.)
- ✅ Game history
- ✅ Team statistics

## Database Schema

The app uses the following main tables:
- `users` - User accounts
- `teams` - Teams
- `players` - Players
- `team_players` - Team-player relationships
- `games` - Games
- `innings` - Innings
- `at_bats` - At-bat records
- `outs` - Out records

See `supabase/schema.sql` for complete schema and RLS policies.

## Next Steps

1. Add app icons and splash screens to `assets/` directory
2. Configure app.json with your app details
3. Test on physical devices
4. Build for production using Expo EAS Build

## Troubleshooting

- **Authentication issues**: Verify Google OAuth redirect URIs match Supabase settings
- **Database errors**: Ensure RLS policies are correctly set up
- **Import errors**: Run `npm install` again to ensure all dependencies are installed

