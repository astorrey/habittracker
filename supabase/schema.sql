-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  jersey_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team_Players junction table (many-to-many)
CREATE TABLE IF NOT EXISTS team_players (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (team_id, player_id)
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_away TEXT NOT NULL CHECK (home_away IN ('home', 'away')),
  team_score INTEGER DEFAULT 0,
  opponent_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Innings table
CREATE TABLE IF NOT EXISTS innings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  inning_number INTEGER NOT NULL,
  team_at_bat TEXT NOT NULL CHECK (team_at_bat IN ('home', 'away')),
  team_runs INTEGER DEFAULT 0,
  opponent_runs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, inning_number, team_at_bat)
);

-- At_Bats table
CREATE TABLE IF NOT EXISTS at_bats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  inning_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  hit_type TEXT NOT NULL CHECK (hit_type IN ('single', 'double', 'triple', 'homerun', 'walk', 'out', 'error', 'sacrifice', 'hit_by_pitch')),
  bases_reached INTEGER DEFAULT 0 CHECK (bases_reached >= 0 AND bases_reached <= 4),
  rbi INTEGER DEFAULT 0,
  runs_scored INTEGER DEFAULT 0,
  at_bat_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outs table
CREATE TABLE IF NOT EXISTS outs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  inning_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  at_bat_id UUID REFERENCES at_bats(id) ON DELETE SET NULL,
  player_out_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  out_type TEXT NOT NULL CHECK (out_type IN ('strikeout', 'flyout', 'groundout', 'tagged', 'force', 'double_play', 'triple_play')),
  fielded_by_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  out_number INTEGER NOT NULL CHECK (out_number >= 1 AND out_number <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_player_id ON team_players(player_id);
CREATE INDEX IF NOT EXISTS idx_games_team_id ON games(team_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_innings_game_id ON innings(game_id);
CREATE INDEX IF NOT EXISTS idx_at_bats_game_id ON at_bats(game_id);
CREATE INDEX IF NOT EXISTS idx_at_bats_inning_id ON at_bats(inning_id);
CREATE INDEX IF NOT EXISTS idx_at_bats_player_id ON at_bats(player_id);
CREATE INDEX IF NOT EXISTS idx_outs_game_id ON outs(game_id);
CREATE INDEX IF NOT EXISTS idx_outs_inning_id ON outs(inning_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE at_bats ENABLE ROW LEVEL SECURITY;
ALTER TABLE outs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Users can view teams they created or are members of"
  ON teams FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT team_id FROM team_players
      WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Team creators can delete their teams"
  ON teams FOR DELETE
  USING (created_by = auth.uid());

-- Players policies
CREATE POLICY "Users can view all players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Users can create players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update players they created"
  ON players FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Team_Players policies
CREATE POLICY "Users can view team rosters"
  ON team_players FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid() OR
      id IN (
        SELECT team_id FROM team_players
        WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Team creators can add players"
  ON team_players FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

CREATE POLICY "Team creators can remove players"
  ON team_players FOR DELETE
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

-- Games policies
CREATE POLICY "Users can view games for their teams"
  ON games FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid() OR
      id IN (
        SELECT team_id FROM team_players
        WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Team creators can create games"
  ON games FOR INSERT
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

CREATE POLICY "Team creators can update games"
  ON games FOR UPDATE
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

-- Innings policies
CREATE POLICY "Users can view innings for accessible games"
  ON innings FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (
        SELECT id FROM teams
        WHERE created_by = auth.uid() OR
        id IN (
          SELECT team_id FROM team_players
          WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Team creators can create innings"
  ON innings FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
    )
  );

-- At_Bats policies
CREATE POLICY "Users can view at-bats for accessible games"
  ON at_bats FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (
        SELECT id FROM teams
        WHERE created_by = auth.uid() OR
        id IN (
          SELECT team_id FROM team_players
          WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Team creators can create at-bats"
  ON at_bats FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
    )
  );

-- Outs policies
CREATE POLICY "Users can view outs for accessible games"
  ON outs FOR SELECT
  USING (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (
        SELECT id FROM teams
        WHERE created_by = auth.uid() OR
        id IN (
          SELECT team_id FROM team_players
          WHERE player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
        )
      )
    )
  );

CREATE POLICY "Team creators can create outs"
  ON outs FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM games
      WHERE team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
    )
  );

-- Function to sync auth.users with users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

