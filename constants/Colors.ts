/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#87CEEB', // 水色 (スカイブルー)
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    buttonDefault: '#87CEEB', // 水色 (スカイブルー)
    buttonPressed: '#007AFF', // 青色 (iOS標準ブルー)
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    buttonDefault: '#4682B4', // 暗めの水色 (スチールブルー)
    buttonPressed: '#0A84FF', // 青色 (iOS標準ブルー Dark Mode)
  },
};
