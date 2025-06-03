import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react'; // Reactをインポート
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'; // Modal関連をインポート
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useBle } from '@/context/BleContext'; // useBleのインポートを確認

// グローバルポップアップコンポーネント
const GlobalShakePopup = () => {
  const { showShakePopup, closeShakePopup } = useBle(); // closeShakePopup を取得

  if (!showShakePopup) {
    return null;
  }

  // ポップアップのOKボタンが押されたら、BleContextのcloseShakePopupを呼び出す
  // これにより、Context内で登録されたおみくuji処理がトリガーされる
  const handlePopupConfirm = () => {
    closeShakePopup();
    // 以前ここにあったAlertは、closeShakePopup内部のtriggerOmikuji実行後に
    // 実際の処理がされるので、ここでは不要。
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={showShakePopup}
      onRequestClose={handlePopupConfirm} // Androidの戻るボタンでも同様の処理
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