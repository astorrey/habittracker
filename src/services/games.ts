import { supabase } from './supabase';
import { Game, Inning, AtBat, Out, HomeAway, GameStatus } from '../types';

export const getGames = async (teamId?: string): Promise<Game[]> => {
  let query = supabase.from('games').select('*');

  if (teamId) {
    query = query.eq('team_id', teamId);
  }

  const { data, error } = await query.order('game_date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGame = async (
  teamId: string,
  opponentName: string,
  gameDate: string,
  homeAway: HomeAway
): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .insert({
      team_id: teamId,
      opponent_name: opponentName,
      game_date: gameDate,
      home_away: homeAway,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGame = async (
  gameId: string,
  updates: Partial<Game>
): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', gameId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getGameById = async (gameId: string): Promise<Game | null> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) throw error;
  return data;
};

export const getInnings = async (gameId: string): Promise<Inning[]> => {
  const { data, error } = await supabase
    .from('innings')
    .select('*')
    .eq('game_id', gameId)
    .order('inning_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createInning = async (
  gameId: string,
  inningNumber: number,
  teamAtBat: HomeAway
): Promise<Inning> => {
  const { data, error } = await supabase
    .from('innings')
    .insert({
      game_id: gameId,
      inning_number: inningNumber,
      team_at_bat: teamAtBat,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAtBats = async (gameId: string, inningId?: string): Promise<AtBat[]> => {
  let query = supabase.from('at_bats').select('*, players(*)').eq('game_id', gameId);

  if (inningId) {
    query = query.eq('inning_id', inningId);
  }

  const { data, error } = await query.order('at_bat_number', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createAtBat = async (atBat: Omit<AtBat, 'id' | 'created_at'>): Promise<AtBat> => {
  const { data, error } = await supabase
    .from('at_bats')
    .insert(atBat)
    .select('*, players(*)')
    .single();

  if (error) throw error;
  return data;
};

export const getOuts = async (gameId: string, inningId?: string): Promise<Out[]> => {
  let query = supabase
    .from('outs')
    .select('*, player_out:players!player_out_id(*), fielded_by:players!fielded_by_player_id(*)')
    .eq('game_id', gameId);

  if (inningId) {
    query = query.eq('inning_id', inningId);
  }

  const { data, error } = await query.order('out_number', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createOut = async (out: Omit<Out, 'id' | 'created_at'>): Promise<Out> => {
  const { data, error } = await supabase
    .from('outs')
    .insert(out)
    .select('*, player_out:players!player_out_id(*), fielded_by:players!fielded_by_player_id(*)')
    .single();

  if (error) throw error;
  return data;
};

