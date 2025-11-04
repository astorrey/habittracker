import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getGameById, updateGame, getInnings, createInning, getAtBats, createAtBat, getOuts, createOut } from '../services/games';
import { getTeamPlayers } from '../services/teams';
import { Game, Inning, AtBat, Out, HitType, OutType, HomeAway } from '../types';
import { getBasesReached } from '../utils/calculations';

const LiveScorebookScreen = ({ route, navigation }: any) => {
  const { gameId } = route.params;
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentInning, setCurrentInning] = useState<Inning | null>(null);
  const [innings, setInnings] = useState<Inning[]>([]);
  const [atBats, setAtBats] = useState<AtBat[]>([]);
  const [outs, setOuts] = useState<Out[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showHitTypeModal, setShowHitTypeModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [baseRunners, setBaseRunners] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const gameData = await getGameById(gameId);
      if (!gameData) {
        Alert.alert('Error', 'Game not found');
        return;
      }
      
      const [playersData, inningsData] = await Promise.all([
        getTeamPlayers(gameData.team_id),
        getInnings(gameId),
      ]);
      
      setGame(gameData);
      setPlayers(playersData.map((tp: any) => tp.players).filter(Boolean));
      
      if (inningsData.length === 0) {
        // Create first inning
        const firstInning = await createInning(gameId, 1, 'home');
        setCurrentInning(firstInning);
        setInnings([firstInning]);
      } else {
        const lastInning = inningsData[inningsData.length - 1];
        setCurrentInning(lastInning);
        setInnings(inningsData);
      }
      
      await loadInningData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load game data');
    } finally {
      setLoading(false);
    }
  };

  const loadInningData = async () => {
    if (!currentInning) return;
    try {
      const [atBatsData, outsData] = await Promise.all([
        getAtBats(gameId, currentInning.id),
        getOuts(gameId, currentInning.id),
      ]);
      setAtBats(atBatsData);
      setOuts(outsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load inning data');
    }
  };

  useEffect(() => {
    if (currentInning) {
      loadInningData();
    }
  }, [currentInning]);

  const handleAtBat = async (hitType: HitType) => {
    if (!selectedPlayerId || !currentInning) {
      Alert.alert('Error', 'Please select a player');
      return;
    }

    try {
      const basesReached = getBasesReached(hitType);
      const atBatNumber = atBats.length + 1;
      
      const newAtBat = await createAtBat({
        game_id: gameId,
        inning_id: currentInning.id,
        player_id: selectedPlayerId,
        hit_type: hitType,
        bases_reached: basesReached,
        rbi: 0, // TODO: Calculate RBIs based on base runners
        runs_scored: basesReached === 4 ? 1 : 0,
        at_bat_number: atBatNumber,
      });

      // Update base runners
      updateBaseRunners(hitType, selectedPlayerId);
      
      // Update score if run scored
      if (basesReached === 4 && game) {
        const newScore = currentInning.team_at_bat === 'home' 
          ? game.team_score + 1 
          : game.opponent_score + 1;
        await updateGame(gameId, {
          team_score: currentInning.team_at_bat === 'home' ? newScore : game.team_score,
          opponent_score: currentInning.team_at_bat === 'away' ? newScore : game.opponent_score,
        });
        await loadGameData();
      }

      setShowHitTypeModal(false);
      setSelectedPlayerId('');
      await loadInningData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record at-bat');
    }
  };

  const handleOut = async (outType: OutType, fieldedByPlayerId?: string) => {
    if (!selectedPlayerId || !currentInning) {
      Alert.alert('Error', 'Please select a player');
      return;
    }

    try {
      const outNumber = outs.length + 1;
      await createOut({
        game_id: gameId,
        inning_id: currentInning.id,
        player_out_id: selectedPlayerId,
        out_type: outType,
        fielded_by_player_id: fieldedByPlayerId,
        out_number: outNumber,
      });

      if (outNumber >= 3) {
        // End of inning
        await advanceInning();
      }

      setShowOutModal(false);
      setSelectedPlayerId('');
      setBaseRunners({});
      await loadInningData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record out');
    }
  };

  const updateBaseRunners = (hitType: HitType, batterId: string) => {
    const bases = getBasesReached(hitType);
    const newRunners: { [key: number]: string } = {};

    // Move existing runners
    Object.keys(baseRunners).forEach((base) => {
      const baseNum = parseInt(base);
      const newBase = baseNum + bases;
      if (newBase <= 4) {
        newRunners[newBase] = baseRunners[baseNum];
      }
    });

    // Add batter
    if (bases < 4) {
      newRunners[bases] = batterId;
    }

    setBaseRunners(newRunners);
  };

  const advanceInning = async () => {
    if (!game || !currentInning) return;

    const nextInningNumber = currentInning.inning_number + 1;
    const nextTeamAtBat: HomeAway = currentInning.team_at_bat === 'home' ? 'away' : 'home';
    
    try {
      const newInning = await createInning(gameId, nextInningNumber, nextTeamAtBat);
      setCurrentInning(newInning);
      setInnings([...innings, newInning]);
      setBaseRunners({});
      await loadInningData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to advance inning');
    }
  };

  const handlePlayerSelect = () => {
    setShowPlayerModal(true);
  };

  if (loading || !game) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentOuts = outs.length;
  const isInningOver = currentOuts >= 3;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{game.team_id}</Text>
            <Text style={styles.score}>{game.team_score}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.teamName}>{game.opponent_name}</Text>
            <Text style={styles.score}>{game.opponent_score}</Text>
          </View>
        </View>

        {/* Inning Info */}
        <View style={styles.inningContainer}>
          <Text style={styles.inningText}>
            Inning {currentInning?.inning_number || 1} - {currentInning?.team_at_bat === 'home' ? 'Home' : 'Away'}
          </Text>
          <Text style={styles.outsText}>Outs: {currentOuts}/3</Text>
        </View>

        {/* Base Runners */}
        <View style={styles.basesContainer}>
          <View style={[styles.base, baseRunners[1] && styles.baseOccupied]}>
            <Text style={styles.baseLabel}>1st</Text>
          </View>
          <View style={[styles.base, baseRunners[2] && styles.baseOccupied]}>
            <Text style={styles.baseLabel}>2nd</Text>
          </View>
          <View style={[styles.base, baseRunners[3] && styles.baseOccupied]}>
            <Text style={styles.baseLabel}>3rd</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePlayerSelect}
            disabled={isInningOver}
          >
            <Text style={styles.actionButtonText}>
              {selectedPlayerId ? 'Change Player' : 'Select Player'}
            </Text>
          </TouchableOpacity>

          {selectedPlayerId && !isInningOver && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.hitButton]}
                onPress={() => setShowHitTypeModal(true)}
              >
                <Text style={styles.actionButtonText}>Record Hit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.outButton]}
                onPress={() => setShowOutModal(true)}
              >
                <Text style={styles.actionButtonText}>Record Out</Text>
              </TouchableOpacity>
            </>
          )}

          {isInningOver && (
            <TouchableOpacity
              style={[styles.actionButton, styles.advanceButton]}
              onPress={advanceInning}
            >
              <Text style={styles.actionButtonText}>Next Inning</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Player Selection Modal */}
      <Modal visible={showPlayerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Player</Text>
            <ScrollView>
              {players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.playerOption}
                  onPress={() => {
                    setSelectedPlayerId(player.id);
                    setShowPlayerModal(false);
                  }}
                >
                  <Text style={styles.playerOptionText}>
                    {player.first_name} {player.last_name}
                    {player.jersey_number && ` #${player.jersey_number}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPlayerModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Hit Type Modal */}
      <Modal visible={showHitTypeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Hit Type</Text>
            {(['single', 'double', 'triple', 'homerun', 'walk'] as HitType[]).map((hitType) => (
              <TouchableOpacity
                key={hitType}
                style={styles.optionButton}
                onPress={() => handleAtBat(hitType)}
              >
                <Text style={styles.optionText}>{hitType.charAt(0).toUpperCase() + hitType.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHitTypeModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Out Type Modal */}
      <Modal visible={showOutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Out Type</Text>
            {(['strikeout', 'flyout', 'groundout', 'tagged', 'force'] as OutType[]).map((outType) => (
              <TouchableOpacity
                key={outType}
                style={styles.optionButton}
                onPress={() => handleOut(outType)}
              >
                <Text style={styles.optionText}>{outType.charAt(0).toUpperCase() + outType.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowOutModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scoreContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    color: '#333',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inningContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inningText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  outsText: {
    fontSize: 16,
    color: '#666',
  },
  basesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  base: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseOccupied: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  baseLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  hitButton: {
    backgroundColor: '#34a853',
  },
  outButton: {
    backgroundColor: '#ea4335',
  },
  advanceButton: {
    backgroundColor: '#fbbc04',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  playerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  optionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#4285f4',
    fontWeight: '600',
  },
});

export default LiveScorebookScreen;

