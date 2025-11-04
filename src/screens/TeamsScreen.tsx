import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { getTeams, createTeam } from '../services/teams';
import { Team } from '../types';

const TeamsScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, [user]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={async () => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await signOut();
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'Failed to sign out');
                    }
                  },
                },
              ]
            );
          }}
          style={{ marginRight: 16 }}
        >
          <Text style={{ color: '#4285f4', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, signOut]);

  const loadTeams = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getTeams(user.id);
      setTeams(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    Alert.prompt(
      'Create Team',
      'Enter team name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (name) => {
            if (!name || !user) return;
            try {
              await createTeam(name, user.id);
              loadTeams();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create team');
            }
          },
        },
      ],
      'plain-text'
    );
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
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teamCard}
            onPress={() => navigation.navigate('TeamDetail', { teamId: item.id })}
          >
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamDate}>
              Created {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No teams yet</Text>
            <Text style={styles.emptySubtext}>Create your first team to get started</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={handleCreateTeam}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  teamCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamDate: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4285f4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
});

export default TeamsScreen;

