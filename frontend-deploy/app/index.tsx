import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as api from '@/lib/api';
import * as guest from '@/lib/guest';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/home');
          return;
        }
      } catch {
        // Supabase unreachable – still show login
      }
      if (typeof window !== 'undefined') {
        try {
          const { ok, url } = await api.checkReachability();
          setServerUrl(url.replace('/api/ping', ''));
          setServerReachable(ok);
        } catch {
          setServerReachable(false);
        }
      }
    })().finally(() => setChecking(false));
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await api.register(email, password, username);
        const data = await api.login(email, password);
        try {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
        } catch (sessionErr) {
          setError('Login succeeded but session failed. Try logging in again.');
          return;
        }
      } else {
        const data = await api.login(email, password);
        try {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
        } catch (sessionErr) {
          setError('Login succeeded but session failed. Try again or check your connection.');
          return;
        }
      }
      router.replace('/home');
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : 'Something went wrong';
      const isNetworkError = /fetch\s*failed|failed\s*to\s*fetch|network\s*(error|request\s*failed)|networkerror|load\s*failed|connection\s*refused|err_connection/i.test(raw) || (raw.length < 30 && /\bfail\b|\bfetch\b|network/i.test(raw));
      const message = isNetworkError
        ? (serverUrl
          ? `Can't reach server at ${serverUrl}. (${raw}) Open from that exact URL on the same network; check the server is running and port 3001 is reachable.`
          : `Can't reach server. (${raw}) Open from http://YOUR-SERVER:3001 on the same network.`)
        : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>DOKI</Text>
        <Text style={styles.subtitle}>Kawaii Cat Battle & Breed</Text>

        <TouchableOpacity
          onPress={() => { guest.setGuest(); router.replace('/home'); }}
          style={styles.guestButton}
          activeOpacity={0.8}
        >
          <Text style={styles.guestText}>Guest login</Text>
        </TouchableOpacity>

        {serverUrl ? (
          <Text style={styles.serverUrl} numberOfLines={1}>
            Server: {serverUrl}
          </Text>
        ) : null}
        {serverReachable === false ? (
          <Text style={styles.warning}>
            Cannot reach server. Open the app from the same URL (e.g. http://YOUR-SERVER:3001) and check your network.
          </Text>
        ) : null}

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{mode === 'login' ? 'Log in' : 'Sign up'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          <Text style={styles.switch}>
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D5FF',
    justifyContent: 'center',
    padding: 24,
  },
  centered: {
    flex: 1,
    backgroundColor: '#E8D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF69B4',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  serverUrl: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  warning: {
    fontSize: 12,
    color: '#c62828',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  error: {
    color: '#c62828',
    fontSize: 13,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FF69B4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  guestButton: {
    backgroundColor: '#E8E0F0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C4B5D4',
  },
  guestText: {
    fontSize: 15,
    color: '#6B5B95',
    fontWeight: '600',
  },
  switch: {
    color: '#9B59B6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
