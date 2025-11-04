export interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Player {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  created_at: string;
}

export interface TeamPlayer {
  team_id: string;
  player_id: string;
  role?: string;
  joined_at: string;
}

export type GameStatus = 'scheduled' | 'in_progress' | 'completed';
export type HomeAway = 'home' | 'away';

export interface Game {
  id: string;
  team_id: string;
  opponent_name: string;
  game_date: string;
  home_away: HomeAway;
  team_score: number;
  opponent_score: number;
  status: GameStatus;
  created_at: string;
}

export interface Inning {
  id: string;
  game_id: string;
  inning_number: number;
  team_at_bat: HomeAway;
  team_runs: number;
  opponent_runs: number;
  created_at: string;
}

export type HitType = 
  | 'single' 
  | 'double' 
  | 'triple' 
  | 'homerun' 
  | 'walk' 
  | 'out' 
  | 'error' 
  | 'sacrifice'
  | 'hit_by_pitch';

export type OutType = 
  | 'strikeout' 
  | 'flyout' 
  | 'groundout' 
  | 'tagged' 
  | 'force' 
  | 'double_play'
  | 'triple_play';

export interface AtBat {
  id: string;
  game_id: string;
  inning_id: string;
  player_id: string;
  hit_type: HitType;
  bases_reached: number;
  rbi: number;
  runs_scored: number;
  at_bat_number: number;
  created_at: string;
}

export interface Out {
  id: string;
  game_id: string;
  inning_id: string;
  at_bat_id?: string;
  player_out_id: string;
  out_type: OutType;
  fielded_by_player_id?: string;
  out_number: number;
  created_at: string;
}

export interface PlayerStats {
  player_id: string;
  player_name: string;
  games_played: number;
  at_bats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeruns: number;
  walks: number;
  rbis: number;
  runs_scored: number;
  batting_average: number;
  on_base_percentage: number;
  slugging_percentage: number;
}

export interface TeamStats {
  team_id: string;
  team_name: string;
  games_played: number;
  wins: number;
  losses: number;
  total_runs: number;
  total_hits: number;
  team_batting_average: number;
}

