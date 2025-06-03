import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react'; // Reactをインポート
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'; // Modal関連をインポート
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { BleProvider, useBle } from '@/context/BleContext'; // 作成したBleProviderとuseBleをインポート

// グローバルポップアップコンポーネント
const GlobalShakePopup = () => {
  const { showShakePopup, closeShakePopup } = useBle();

  if (!showShakePopup) {
    return null;
  }

  const handleCloseAndOmikuji = () => {
    closeShakePopup();
    // TODO: ここでおみくじ処理を実行するナビゲーションや関数呼び出しを行う
    // 例: router.push('/record?action=drawOmikuji'); または特定の関数を呼び出す
    Alert.alert("ポップアップ後処理", "ここでおみくじ画面に遷移したり、結果処理を開始します。");
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showShakePopup}
      onRequestClose={closeShakePopup} // Androidの戻るボタン対応
    >
      <View style={popupStyles.centeredView}>
        <View style={popupStyles.modalView}>
          <Text style={popupStyles.modalTitle}>おみくじ箱</Text>
          <Text style={popupStyles.modalText}>おみくじが振られました！！</Text>
          <Pressable
            style={[popupStyles.button, popupStyles.buttonClose]}
            onPress={handleCloseAndOmikuji} // 将来的にはここでおみくじ処理へ
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
      <BleProvider> {/* BleProviderでラップ */}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <GlobalShakePopup /> {/* グローバルポップアップを配置 */}
      </BleProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

// ポップアップ用スタイル
const popupStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)', // 半透明の背景
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