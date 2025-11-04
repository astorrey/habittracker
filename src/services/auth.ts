import { supabase } from './supabase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const googleAuthProvider = () => {
  return Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri({
      scheme: 'slowpitchsoftball',
      path: 'auth',
    }),
  });
};

export const signInWithGoogle = async (response: any) => {
  if (response?.type === 'success') {
    const { authentication } = response;
    
    if (authentication?.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: authentication.idToken,
      });
      
      if (error) throw error;
      return data;
    }
  }
  throw new Error('Google sign-in failed');
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

