import { supabase } from './supabase';
import { PlayerStats, TeamStats } from '../types';

export const getPlayerStats = async (playerId: string, teamId?: string): Promise<PlayerStats> => {
  let atBatsQuery = supabase
    .from('at_bats')
    .select('*, players(*)')
    .eq('player_id', playerId);

  const { data: atBats, error } = await atBatsQuery;

  if (error) throw error;

  // Filter by team if specified
  let filteredAtBats = atBats || [];
  if (teamId) {
    const { data: teamGames } = await supabase
      .from('games')
      .select('id')
      .eq('team_id', teamId);
    
    const gameIds = teamGames?.map(g => g.id) || [];
    filteredAtBats = filteredAtBats.filter(ab => gameIds.includes(ab.game_id));
  }

  const stats = calculatePlayerStats(filteredAtBats, playerId);
  return stats;
};

export const getTeamStats = async (teamId: string): Promise<TeamStats> => {
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'completed');

  if (gamesError) throw gamesError;

  const { data: atBats, error: atBatsError } = await supabase
    .from('at_bats')
    .select('*')
    .in('game_id', games?.map(g => g.id) || []);

  if (atBatsError) throw atBatsError;

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single();

  if (teamError) throw teamError;

  const wins = games?.filter(g => g.team_score > g.opponent_score).length || 0;
  const losses = games?.filter(g => g.team_score < g.opponent_score).length || 0;
  const totalRuns = games?.reduce((sum, g) => sum + g.team_score, 0) || 0;
  const totalHits = atBats?.filter(ab => 
    ['single', 'double', 'triple', 'homerun'].includes(ab.hit_type)
  ).length || 0;
  const totalAtBats = atBats?.length || 0;
  const teamBattingAverage = totalAtBats > 0 ? totalHits / totalAtBats : 0;

  return {
    team_id: teamId,
    team_name: team.name,
    games_played: games?.length || 0,
    wins,
    losses,
    total_runs: totalRuns,
    total_hits: totalHits,
    team_batting_average: teamBattingAverage,
  };
};

const calculatePlayerStats = (atBats: any[], playerId: string): PlayerStats => {
  const player = atBats[0]?.players;
  const playerName = player ? `${player.first_name} ${player.last_name}` : 'Unknown';

  const hits = atBats.filter(ab => 
    ['single', 'double', 'triple', 'homerun'].includes(ab.hit_type)
  );
  const singles = hits.filter(ab => ab.hit_type === 'single').length;
  const doubles = hits.filter(ab => ab.hit_type === 'double').length;
  const triples = hits.filter(ab => ab.hit_type === 'triple').length;
  const homeruns = hits.filter(ab => ab.hit_type === 'homerun').length;
  const walks = atBats.filter(ab => ab.hit_type === 'walk').length;
  
  const totalHits = hits.length;
  const totalAtBats = atBats.filter(ab => ab.hit_type !== 'walk' && ab.hit_type !== 'hit_by_pitch').length;
  const battingAverage = totalAtBats > 0 ? totalHits / totalAtBats : 0;
  
  const totalBases = singles + (doubles * 2) + (triples * 3) + (homeruns * 4);
  const sluggingPercentage = totalAtBats > 0 ? totalBases / totalAtBats : 0;
  
  const onBase = totalHits + walks;
  const plateAppearances = atBats.length;
  const onBasePercentage = plateAppearances > 0 ? onBase / plateAppearances : 0;

  const rbis = atBats.reduce((sum, ab) => sum + (ab.rbi || 0), 0);
  const runsScored = atBats.reduce((sum, ab) => sum + (ab.runs_scored || 0), 0);
  
  const uniqueGames = new Set(atBats.map(ab => ab.game_id));
  const gamesPlayed = uniqueGames.size;

  return {
    player_id: playerId,
    player_name: playerName,
    games_played: gamesPlayed,
    at_bats: totalAtBats,
    hits: totalHits,
    doubles,
    triples,
    homeruns,
    walks,
    rbis,
    runs_scored: runsScored,
    batting_average: battingAverage,
    on_base_percentage: onBasePercentage,
    slugging_percentage: sluggingPercentage,
  };
};

