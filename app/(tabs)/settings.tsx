import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Linking,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Notifications from 'expo-notifications'; // 通知設定用
// import * as Application from 'expo-application'; // アプリバージョン取得用

// 設定項目のキー
const SETTINGS_KEYS = {
  notificationsEnabled: 'settings_notifications_enabled',
  soundEffectsEnabled: 'settings_sound_effects_enabled',
  musicEnabled: 'settings_music_enabled',
};

interface AppSettings {
  notificationsEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicEnabled: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: false,
    soundEffectsEnabled: true,
    musicEnabled: true,
  });
  const [appVersion, setAppVersion] = useState<string>('');

  // 設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notificationsEnabled = await AsyncStorage.getItem(SETTINGS_KEYS.notificationsEnabled);
        const soundEffectsEnabled = await AsyncStorage.getItem(SETTINGS_KEYS.soundEffectsEnabled);
        const musicEnabled = await AsyncStorage.getItem(SETTINGS_KEYS.musicEnabled);

        setSettings({
          notificationsEnabled: notificationsEnabled === 'true',
          soundEffectsEnabled: soundEffectsEnabled === null ? true : soundEffectsEnabled === 'true', // デフォルトtrue
          musicEnabled: musicEnabled === null ? true : musicEnabled === 'true', // デフォルトtrue
        });
      } catch (e) {
        console.error('Failed to load settings.', e);
      }
    };

    // const getAppVersion = () => {
    //   if (Platform.OS === 'ios') {
    //     setAppVersion(Application.nativeApplicationVersion || 'N/A');
    //   } else {
    //     setAppVersion(Application.nativeApplicationVersion || 'N/A'); // Androidも同様に取得可能
    //   }
    // };

    loadSettings();
    // getAppVersion();
    setAppVersion('1.0.0 (仮)'); // expo-application を入れるまでは仮表示
  }, []);

  // 設定値を保存
  const updateSetting = async (key: keyof AppSettings, value: boolean) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEYS[key], value.toString());
      setSettings(prevSettings => ({
        ...prevSettings,
        [key]: value,
      }));

      // if (key === 'notificationsEnabled') {
      //   if (value) {
      //     // TODO: 通知許可をリクエストし、スケジュールを設定するロジック
      //     console.log('通知が有効になりました。許可リクエストとスケジュール設定が必要です。');
      //     // const { status } = await Notifications.requestPermissionsAsync();
      //     // if (status !== 'granted') {
      //     //   Alert.alert('通知許可が得られませんでした。');
      //     //   // スイッチを元に戻す
      //     //   setSettings(prev => ({ ...prev, notificationsEnabled: false }));
      //     //   await AsyncStorage.setItem(SETTINGS_KEYS.notificationsEnabled, 'false');
      //     //   return;
      //     // }
      //   } else {
      //     // TODO: 通知をキャンセルするロジック
      //     // await Notifications.cancelAllScheduledNotificationsAsync();
      //     console.log('通知が無効になりました。スケジュールされた通知をキャンセルします。');
      //   }
      // }
    } catch (e) {
      console.error('Failed to save setting.', e);
      Alert.alert('エラー', '設定の保存に失敗しました。');
    }
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`このURLを開けません: ${url}`);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "データリセットの確認",
      "本当にすべてのアプリデータをリセットしますか？この操作は元に戻せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセットする",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: AsyncStorageの全クリアやSQLiteのデータ削除など、
              // アプリで使用しているすべての永続化データを削除する処理を実装
              // await AsyncStorage.clear(); // 注意: AsyncStorage全体をクリアします
              console.log("データリセット処理を実行（仮）");
              Alert.alert("完了", "アプリのデータがリセットされました。アプリを再起動してください。");
              // 必要に応じてアプリを強制終了または再起動を促す
            } catch (e) {
              console.error("Failed to reset data.", e);
              Alert.alert("エラー", "データのリセットに失敗しました。");
            }
          },
        },
      ]
    );
  };

  const SettingItem: React.FC<{ title: string; children?: React.ReactNode; onPress?: () => void; isSwitch?: boolean; switchValue?: boolean; onSwitchChange?: (value: boolean) => void }> =
    ({ title, children, onPress, isSwitch, switchValue, onSwitchChange }) => (
    <Pressable style={styles.itemContainer} onPress={onPress} disabled={!onPress && !isSwitch}>
      <Text style={styles.itemTitle}>{title}</Text>
      {isSwitch && onSwitchChange ? (
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={switchValue ? "#007AFF" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : children}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>設定</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          <SettingItem
            title="服薬リマインダー通知"
            isSwitch
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(value) => updateSetting('notificationsEnabled', value)}
          />
          {/* TODO: 通知時間設定などの項目をここに追加 */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サウンド設定</Text>
          <SettingItem
            title="BGM"
            isSwitch
            switchValue={settings.musicEnabled}
            onSwitchChange={(value) => updateSetting('musicEnabled', value)}
          />
          <SettingItem
            title="効果音"
            isSwitch
            switchValue={settings.soundEffectsEnabled}
            onSwitchChange={(value) => updateSetting('soundEffectsEnabled', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ管理</Text>
          {/* <SettingItem title="データバックアップ" onPress={() => Alert.alert('未実装', 'この機能は現在準備中です。')} /> */}
          <SettingItem title="アプリデータをリセット" onPress={handleResetData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ヘルプ</Text>
          <SettingItem title="遊び方ガイド" onPress={() => Alert.alert('未実装', '遊び方ガイドは準備中です。')} />
          <SettingItem title="よくある質問 (FAQ)" onPress={() => Alert.alert('未実装', 'FAQは準備中です。')} />
        </View>

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>保護者向けメニュー</Text>
          <SettingItem title="利用時間の確認" onPress={() => Alert.alert('未実装', 'この機能は現在準備中です。')} />
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>情報</Text>
          <SettingItem title="利用規約" onPress={() => openLink('https://example.com/terms')} />
          <SettingItem title="プライバシーポリシー" onPress={() => openLink('https://example.com/privacy')} />
          <SettingItem title="お問い合わせ" onPress={() => openLink('mailto:support@example.com')} />
          <SettingItem title="アプリバージョン">
            <Text style={styles.itemValue}>{appVersion}</Text>
          </SettingItem>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  container: {
    paddingBottom: 30, // スクロール末尾の余白
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Android Shadow
    elevation: 1,
    overflow: 'hidden', // 子要素がborderRadiusを無視しないように
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 8,
    backgroundColor: '#F9F9F9', // セクションヘッダー背景
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
  },
  itemValue: {
    fontSize: 16,
    color: '#555',
  },
});