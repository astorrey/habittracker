import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { createGame } from '../services/games';
import { getTeams } from '../services/teams';
import { Team, HomeAway } from '../types';
import { useAuth } from '../hooks/useAuth';

const GameSetupScreen = ({ route, navigation }: any) => {
  const { teamId: initialTeamId } = route.params || {};
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || '');
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [gameDate, setGameDate] = useState(new Date().toISOString().split('T')[0]);
  const [homeAway, setHomeAway] = useState<HomeAway>('home');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showHomeAwayModal, setShowHomeAwayModal] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [user]);

  const loadTeams = async () => {
    if (!user) return;
    try {
      const data = await getTeams(user.id);
      setTeams(data);
      if (data.length > 0 && !initialTeamId) {
        setSelectedTeamId(data[0].id);
        setSelectedTeamName(data[0].name);
      } else if (initialTeamId && data.length > 0) {
        const team = data.find(t => t.id === initialTeamId);
        if (team) {
          setSelectedTeamName(team.name);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load teams');
    }
  };

  const handleCreateGame = async () => {
    if (!selectedTeamId) {
      Alert.alert('Error', 'Please select a team');
      return;
    }
    if (!opponentName.trim()) {
      Alert.alert('Error', 'Please enter opponent name');
      return;
    }

    try {
      const game = await createGame(
        selectedTeamId,
        opponentName.trim(),
        new Date(gameDate).toISOString(),
        homeAway
      );
      navigation.navigate('LiveScorebook', { gameId: game.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create game');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Team</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTeamModal(true)}
        >
          <Text style={styles.selectButtonText}>
            {selectedTeamName || 'Select Team'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Opponent</Text>
        <TextInput
          style={styles.input}
          placeholder="Opponent team name"
          value={opponentName}
          onChangeText={setOpponentName}
        />

        <Text style={styles.label}>Game Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={gameDate}
          onChangeText={setGameDate}
        />

        <Text style={styles.label}>Home or Away</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowHomeAwayModal(true)}
        >
          <Text style={styles.selectButtonText}>
            {homeAway === 'home' ? 'Home' : 'Away'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCreateGame}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </View>

      {/* Team Selection Modal */}
      <Modal visible={showTeamModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Team</Text>
            <ScrollView>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedTeamId(team.id);
                    setSelectedTeamName(team.name);
                    setShowTeamModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{team.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTeamModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Home/Away Selection Modal */}
      <Modal visible={showHomeAwayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Home or Away</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setHomeAway('home');
                setShowHomeAwayModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setHomeAway('away');
                setShowHomeAwayModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Away</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowHomeAwayModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
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
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
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
  button: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default GameSetupScreen;

