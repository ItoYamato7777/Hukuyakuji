/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#00838f', // <-- ここの値を変更（例：'#111' から濃い水色へ）
    background: '#fff',
    tint: '#0a7ea4',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    buttonDefault: '#1e90ff',
    buttonPressed: '#007bff',
  },
  dark: {
    text: '#e0f7fa', // <-- ダークモードの文字色も必要に応じて変更
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    buttonDefault: '#1e90ff',
    buttonPressed: '#007bff',
  },
};
