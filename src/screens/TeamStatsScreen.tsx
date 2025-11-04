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
import { useAuth } from '../hooks/useAuth';
import { getTeams } from '../services/teams';
import { getTeamStats } from '../services/stats';
import { Team, TeamStats } from '../types';

const TeamStatsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [user]);

  useEffect(() => {
    if (selectedTeamId) {
      loadTeamStats(selectedTeamId);
    }
  }, [selectedTeamId]);

  const loadTeams = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getTeams(user.id);
      setTeams(data);
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamStats = async (teamId: string) => {
    try {
      setLoadingStats(true);
      const stats = await getTeamStats(teamId);
      setTeamStats(stats);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load team stats');
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {teams.length > 0 && (
        <View style={styles.teamSelector}>
          <FlatList
            horizontal
            data={teams}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.teamButton,
                  selectedTeamId === item.id && styles.teamButtonSelected,
                ]}
                onPress={() => setSelectedTeamId(item.id)}
              >
                <Text
                  style={[
                    styles.teamButtonText,
                    selectedTeamId === item.id && styles.teamButtonTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {loadingStats ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : teamStats ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Team Overview</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Games Played</Text>
              <Text style={styles.statValue}>{teamStats.games_played}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Wins</Text>
              <Text style={styles.statValue}>{teamStats.wins}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Losses</Text>
              <Text style={styles.statValue}>{teamStats.losses}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Win Percentage</Text>
              <Text style={styles.statValue}>
                {teamStats.games_played > 0
                  ? ((teamStats.wins / teamStats.games_played) * 100).toFixed(1)
                  : '0.0'}
                %
              </Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Batting Statistics</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Runs</Text>
              <Text style={styles.statValue}>{teamStats.total_runs}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Hits</Text>
              <Text style={styles.statValue}>{teamStats.total_hits}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Team Batting Average</Text>
              <Text style={styles.statValue}>
                {teamStats.team_batting_average.toFixed(3)}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No stats available</Text>
          <Text style={styles.emptySubtext}>
            Complete some games to see team statistics
          </Text>
        </View>
      )}
    </View>
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
  teamSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  teamButtonSelected: {
    backgroundColor: '#4285f4',
  },
  teamButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  teamButtonTextSelected: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 16,
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default TeamStatsScreen;

