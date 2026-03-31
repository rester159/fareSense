import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import { colors, spacing, radius, typography, shadows } from '@/constants/kawaiiTheme';
import KawaiiButton from '@/components/KawaiiButton';
import LoadingScreen from '@/components/LoadingScreen';

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
      if (auth.getToken()) {
        router.replace('/home');
        return;
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
      const data = mode === 'register'
        ? await api.register(email, password, username)
        : await api.login(email, password);
      auth.setToken(data.access_token);
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
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.pinkWhisper }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, shadows.resting]}>
        <Text style={styles.title}>DOKI</Text>
        <Text style={styles.subtitle}>Kawaii Cat Battle & Breed</Text>

        <KawaiiButton
          variant="secondary"
          backgroundColor={colors.lilac}
          color={colors.black}
          onPress={() => { guest.setGuest(); router.replace('/home'); }}
          style={styles.guestButton}
        >
          Guest login
        </KawaiiButton>

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
          placeholderTextColor={colors.grayMuted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.grayMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.grayMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <KawaiiButton
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          primaryAction
          style={{ marginTop: spacing.sm }}
        >
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </KawaiiButton>

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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.cardPadding,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.fontExtraBold,
    color: colors.pinkHot,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.grayMid,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  serverUrl: {
    fontSize: typography.xs,
    color: colors.grayMuted,
    marginBottom: spacing.xs,
  },
  warning: {
    fontSize: typography.xs,
    color: colors.error,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.pinkMedium,
    borderRadius: radius.input,
    padding: spacing.inputPadding,
    fontSize: typography.base,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  error: {
    color: colors.error,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
  guestButton: {
    marginBottom: spacing.md,
  },
  switch: {
    color: colors.lavender,
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
