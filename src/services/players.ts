import { supabase } from './supabase';
import { Player } from '../types';

export const getPlayers = async (teamId?: string): Promise<Player[]> => {
  let query = supabase.from('players').select('*');

  if (teamId) {
    query = supabase
      .from('players')
      .select('*')
      .in('id', supabase.from('team_players').select('player_id').eq('team_id', teamId));
  }

  const { data, error } = await query.order('last_name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createPlayer = async (
  firstName: string,
  lastName: string,
  jerseyNumber?: number,
  userId?: string
): Promise<Player> => {
  const { data, error } = await supabase
    .from('players')
    .insert({
      first_name: firstName,
      last_name: lastName,
      jersey_number: jerseyNumber,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlayer = async (
  playerId: string,
  updates: Partial<Player>
): Promise<Player> => {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) throw error;
  return data;
};

