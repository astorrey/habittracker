import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { googleAuthProvider, signInWithGoogle } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

const AuthScreen = () => {
  const [request, response, promptAsync] = googleAuthProvider();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response);
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Failed to sign in with Google');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (authResponse: any) => {
    try {
      setLoading(true);
      await signInWithGoogle(authResponse);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate sign in');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Slow Pitch Softball</Text>
      <Text style={styles.subtitle}>Track your team's stats and games</Text>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign in with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;

