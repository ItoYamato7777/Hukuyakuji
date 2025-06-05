import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Alert } from 'react-native'; // Alertをインポート
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { BleProvider, useBle } from '@/context/BleContext';
import { CharacterProvider } from '@/context/CharacterContext'; // 作成したCharacterProviderをインポート

// グローバルポップアップコンポーネント (変更なし、ただしAlertのインポートをファイル上部で確認)
const GlobalShakePopup = () => {
  const { showShakePopup, closeShakePopup } = useBle();

  if (!showShakePopup) {
    return null;
  }

  const handlePopupConfirm = () => {
    closeShakePopup();
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showShakePopup}
      onRequestClose={handlePopupConfirm}
    >
      <View style={popupStyles.centeredView}>
        <View style={popupStyles.modalView}>
          <Text style={popupStyles.modalTitle}>おみくじ箱</Text>
          <Text style={popupStyles.modalText}>おみくじが振られました！！</Text>
          <Pressable
            style={[popupStyles.button, popupStyles.buttonClose]}
            onPress={handlePopupConfirm}
          >
            <Text style={popupStyles.textStyle}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // 'NotoSansJP-Regular': require('../assets/fonts/NotoSansJP-Regular.otf'),
    // 'NotoSansJP-Bold': require('../assets/fonts/NotoSansJP-Bold.otf'),
  });

  useEffect(() => {
    if (error) {
      console.error('フォントの読み込みに失敗しました:', error);
    }
  }, [error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BleProvider>
        <CharacterProvider> {/* CharacterProviderでBleProviderの子要素をラップ */}
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <GlobalShakePopup />
        </CharacterProvider>
      </BleProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

// ポップアップ用スタイル (変更なし)
const popupStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  }
});