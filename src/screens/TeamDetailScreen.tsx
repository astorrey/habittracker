import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { getTeamById, getTeamPlayers, getGames } from '../services/teams';
import { getGames as getTeamGames } from '../services/games';
import { Team, Player, Game } from '../types';

const TeamDetailScreen = ({ route, navigation }: any) => {
  const { teamId } = route.params;
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamData, playersData, gamesData] = await Promise.all([
        getTeamById(teamId),
        getTeamPlayers(teamId),
        getTeamGames(teamId),
      ]);
      setTeam(teamData);
      setPlayers(playersData);
      setGames(gamesData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.center}>
        <Text>Team not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamName}>{team.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('GameSetup', { teamId: team.id })}
        >
          <Text style={styles.actionButtonText}>Start New Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('PlayerStats', { teamId: team.id })}
        >
          <Text style={styles.actionButtonText}>View Team Stats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roster ({players.length})</Text>
        {players.length === 0 ? (
          <Text style={styles.emptyText}>No players added yet</Text>
        ) : (
          players.map((tp: any) => (
            <View key={tp.player_id} style={styles.playerRow}>
              <Text style={styles.playerName}>
                {tp.players?.first_name} {tp.players?.last_name}
                {tp.players?.jersey_number && ` #${tp.players.jersey_number}`}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Games ({games.length})</Text>
        {games.length === 0 ? (
          <Text style={styles.emptyText}>No games yet</Text>
        ) : (
          games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameRow}
              onPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
            >
              <View>
                <Text style={styles.gameOpponent}>vs {game.opponent_name}</Text>
                <Text style={styles.gameDate}>
                  {new Date(game.game_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>
                  {game.team_score} - {game.opponent_score}
                </Text>
                <Text style={styles.gameStatus}>{game.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerName: {
    fontSize: 16,
    color: '#333',
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gameOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  gameDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  gameStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default TeamDetailScreen;

