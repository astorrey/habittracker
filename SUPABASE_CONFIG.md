# Supabase Configuration

## Project Details

- **Project Name**: Slowplay
- **Project ID**: jncbhvyjxmedrkvkodsn
- **Region**: us-east-1
- **Status**: ACTIVE_HEALTHY

## Database Credentials

Add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://jncbhvyjxmedrkvkodsn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuY2JodnlqeG1lZHJrdmtvZHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODE3MTEsImV4cCI6MjA3Nzg1NzcxMX0.2iI-qmWokrMqucI98-r-0LimjvJC2cdUTvkhtAsMEUo
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Database Schema

The following tables have been created with Row Level Security (RLS) enabled:

- ✅ `users` - User accounts (extends auth.users)
- ✅ `teams` - Teams
- ✅ `players` - Players
- ✅ `team_players` - Team-player relationships (many-to-many)
- ✅ `games` - Games
- ✅ `innings` - Innings
- ✅ `at_bats` - At-bat records
- ✅ `outs` - Out records

All tables have proper indexes, foreign keys, and RLS policies configured.

## Next Steps

1. Configure Google OAuth in Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

2. Update your `.env` file with the credentials above

3. Install dependencies and run the app:
   ```bash
   npm install
   npm start
   ```

## Security Notes

- All tables have RLS enabled
- Users can only access data for teams they created or are members of
- The `handle_new_user()` trigger automatically creates user records on signup
- Function security has been configured with proper search_path

