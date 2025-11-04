import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getPlayerStats } from '../services/stats';
import { getPlayerById } from '../services/players';
import { PlayerStats as PlayerStatsType, Player } from '../types';

const PlayerStatsScreen = ({ route, navigation }: any) => {
  const { playerId, teamId } = route.params;
  const [stats, setStats] = useState<PlayerStatsType | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [playerId, teamId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [statsData, playerData] = await Promise.all([
        getPlayerStats(playerId, teamId),
        getPlayerById(playerId),
      ]);
      setStats(statsData);
      setPlayer(playerData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load player stats');
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

  if (!stats || !player) {
    return (
      <View style={styles.center}>
        <Text>No stats available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.playerName}>
          {player.first_name} {player.last_name}
          {player.jersey_number && ` #${player.jersey_number}`}
        </Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Batting Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Games Played</Text>
          <Text style={styles.statValue}>{stats.games_played}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>At-Bats</Text>
          <Text style={styles.statValue}>{stats.at_bats}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Hits</Text>
          <Text style={styles.statValue}>{stats.hits}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Batting Average</Text>
          <Text style={styles.statValue}>
            {stats.batting_average.toFixed(3)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>On-Base Percentage</Text>
          <Text style={styles.statValue}>
            {stats.on_base_percentage.toFixed(3)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Slugging Percentage</Text>
          <Text style={styles.statValue}>
            {stats.slugging_percentage.toFixed(3)}
          </Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Hit Breakdown</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Doubles</Text>
          <Text style={styles.statValue}>{stats.doubles}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Triples</Text>
          <Text style={styles.statValue}>{stats.triples}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Home Runs</Text>
          <Text style={styles.statValue}>{stats.homeruns}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Walks</Text>
          <Text style={styles.statValue}>{stats.walks}</Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Runs & RBIs</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Runs Scored</Text>
          <Text style={styles.statValue}>{stats.runs_scored}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>RBIs</Text>
          <Text style={styles.statValue}>{stats.rbis}</Text>
        </View>
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
    marginBottom: 16,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default PlayerStatsScreen;

