import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme'; // 既存のフックを利用

// フォントの読み込み (既存のものを流用)
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // 既存のフォント
    // TODO: アプリの雰囲気に合わせて他のカスタムフォントを追加する
    // 'NotoSansJP-Regular': require('../assets/fonts/NotoSansJP-Regular.otf'),
    // 'NotoSansJP-Bold': require('../assets/fonts/NotoSansJP-Bold.otf'),
  });

  useEffect(() => {
    if (error) {
      console.error('フォントの読み込みに失敗しました:', error);
      // エラーハンドリング: 例えばフォールバックフォントを使用する、エラー画面を表示するなど
    }
  }, [error]);

  if (!loaded && !error) { // エラーがない場合のみロード完了を待つ
    return null; // フォントが読み込まれるまで何も表示しない
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 初期画面としてBluetooth接続画面 (app/index.tsx) を指定 */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* メインのタブ画面群 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* 404 Not Found 画面 (既存のものを流用) */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}