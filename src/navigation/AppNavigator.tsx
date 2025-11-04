import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/LoadingScreen';
import AuthScreen from '../screens/AuthScreen';
import TeamsScreen from '../screens/TeamsScreen';
import TeamDetailScreen from '../screens/TeamDetailScreen';
import PlayersScreen from '../screens/PlayersScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import LiveScorebookScreen from '../screens/LiveScorebookScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import PlayerStatsScreen from '../screens/PlayerStatsScreen';
import TeamStatsScreen from '../screens/TeamStatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Players" component={PlayersScreen} />
      <Tab.Screen name="Stats" component={TeamStatsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
            <Stack.Screen name="GameSetup" component={GameSetupScreen} />
            <Stack.Screen name="LiveScorebook" component={LiveScorebookScreen} />
            <Stack.Screen name="GameDetail" component={GameDetailScreen} />
            <Stack.Screen name="PlayerStats" component={PlayerStatsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

