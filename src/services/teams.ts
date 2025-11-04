import { supabase } from './supabase';
import { Team, TeamPlayer } from '../types';

export const getTeams = async (userId: string): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .or(`created_by.eq.${userId},id.in.(select team_id from team_players where player_id in (select id from players where user_id.eq.${userId}))`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createTeam = async (name: string, userId: string): Promise<Team> => {
  const { data, error } = await supabase
    .from('teams')
    .insert({ name, created_by: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTeamPlayers = async (teamId: string): Promise<TeamPlayer[]> => {
  const { data, error } = await supabase
    .from('team_players')
    .select('*, players(*)')
    .eq('team_id', teamId);

  if (error) throw error;
  return data || [];
};

export const addPlayerToTeam = async (teamId: string, playerId: string, role?: string): Promise<TeamPlayer> => {
  const { data, error } = await supabase
    .from('team_players')
    .insert({ team_id: teamId, player_id: playerId, role })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removePlayerFromTeam = async (teamId: string, playerId: string): Promise<void> => {
  const { error } = await supabase
    .from('team_players')
    .delete()
    .eq('team_id', teamId)
    .eq('player_id', playerId);

  if (error) throw error;
};

export const getTeamById = async (teamId: string): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
};

