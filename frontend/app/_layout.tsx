import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { duration } from '@/constants/kawaiiTheme';

export default function RootLayout() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            animationDuration: duration.slow,
            contentStyle: { backgroundColor: '#FFF0F5' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="roster" />
          <Stack.Screen name="lootbox" />
          <Stack.Screen name="battle" />
          <Stack.Screen name="breed" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
