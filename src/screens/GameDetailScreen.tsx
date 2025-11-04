import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getGameById, getInnings, getAtBats, getOuts, updateGame } from '../services/games';
import { Game, Inning, AtBat, Out } from '../types';

const GameDetailScreen = ({ route, navigation }: any) => {
  const { gameId } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [innings, setInnings] = useState<Inning[]>([]);
  const [atBats, setAtBats] = useState<AtBat[]>([]);
  const [outs, setOuts] = useState<Out[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const [gameData, inningsData, atBatsData, outsData] = await Promise.all([
        getGameById(gameId),
        getInnings(gameId),
        getAtBats(gameId),
        getOuts(gameId),
      ]);
      
      setGame(gameData);
      setInnings(inningsData);
      setAtBats(atBatsData);
      setOuts(outsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGame = async () => {
    if (!game) return;
    
    Alert.alert(
      'Complete Game',
      'Mark this game as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await updateGame(gameId, { status: 'completed' });
              await loadGameData();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete game');
            }
          },
        },
      ]
    );
  };

  if (loading || !game) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getInningAtBats = (inningId: string) => {
    return atBats.filter(ab => ab.inning_id === inningId);
  };

  const getInningOuts = (inningId: string) => {
    return outs.filter(o => o.inning_id === inningId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.opponent}>vs {game.opponent_name}</Text>
        <Text style={styles.date}>
          {new Date(game.game_date).toLocaleDateString()}
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {game.team_score} - {game.opponent_score}
          </Text>
        </View>
        <Text style={styles.status}>Status: {game.status}</Text>
      </View>

      {game.status !== 'completed' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteGame}
        >
          <Text style={styles.completeButtonText}>Complete Game</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inningsContainer}>
        <Text style={styles.sectionTitle}>Scorebook</Text>
        {innings.map((inning) => {
          const inningAtBats = getInningAtBats(inning.id);
          const inningOuts = getInningOuts(inning.id);
          
          return (
            <View key={inning.id} style={styles.inningCard}>
              <Text style={styles.inningHeader}>
                Inning {inning.inning_number} - {inning.team_at_bat === 'home' ? 'Home' : 'Away'}
              </Text>
              
              {inningAtBats.length > 0 && (
                <View style={styles.atBatsContainer}>
                  <Text style={styles.subsectionTitle}>At-Bats:</Text>
                  {inningAtBats.map((atBat) => (
                    <View key={atBat.id} style={styles.atBatRow}>
                      <Text style={styles.atBatText}>
                        #{atBat.at_bat_number}: {atBat.hit_type} - Bases: {atBat.bases_reached}
                        {atBat.rbi > 0 && ` - RBI: ${atBat.rbi}`}
                        {atBat.runs_scored > 0 && ` - Run: ${atBat.runs_scored}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {inningOuts.length > 0 && (
                <View style={styles.outsContainer}>
                  <Text style={styles.subsectionTitle}>Outs:</Text>
                  {inningOuts.map((out) => (
                    <View key={out.id} style={styles.outRow}>
                      <Text style={styles.outText}>
                        Out #{out.out_number}: {out.out_type}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
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
  opponent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  completeButton: {
    backgroundColor: '#34a853',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inningsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inningCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  inningHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  atBatsContainer: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  atBatRow: {
    paddingVertical: 4,
  },
  atBatText: {
    fontSize: 14,
    color: '#333',
  },
  outsContainer: {
    marginTop: 8,
  },
  outRow: {
    paddingVertical: 4,
  },
  outText: {
    fontSize: 14,
    color: '#333',
  },
});

export default GameDetailScreen;

