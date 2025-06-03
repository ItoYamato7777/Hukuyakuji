import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
// import { BleManager, Device, Characteristic } from 'react-native-ble-plx'; // BLE関連の型定義
// import { useBleContext } from '@/context/BleContext'; // BLE状態をContextから取得 (仮)
// import { useCharacterContext } from '@/context/CharacterContext'; // キャラクター情報をContextから取得・更新 (仮)

// 仮の型定義
interface MedicationRecord {
  id: string;
  type: 'regular' | 'single'; // 常備薬か単発薬か
  medicationName: string;
  timestamp: Date;
  omikujiResult?: '大吉' | '吉' | '小吉' | '凶' | null; // おみくじ結果
  pointsEarned?: number;
  notes?: string;
}

// 仮のサービスUUIDとキャラクタリスティックUUID (実際のデバイスに合わせてください)
const OMOKUJI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914a"; // app/(tabs)/index.tsx から
const OMIKUJI_CHARACTERISTIC_UUID = "beefcafe-36e1-4688-b7f5-00000000000c"; // STEP_DATA_CHAR_UUID に相当するもの

export default function RecordScreen() {
  // const { connectedDevice, bleManager } = useBleContext(); // BLE Contextから取得 (仮)
  // const { character, updateCharacterExperience } = useCharacterContext(); // Character Contextから取得 (仮)

  const [isOmikujiInProgress, setIsOmikujiInProgress] = useState(false);
  const [omikujiStatusMessage, setOmikujiStatusMessage] = useState('');
  const [lastOmikujiResult, setLastOmikujiResult] = useState<Partial<MedicationRecord> | null>(null);

  const [singleMedicationName, setSingleMedicationName] = useState('');
  const [singleMedicationNotes, setSingleMedicationNotes] = useState('');

  const [medicationHistory, setMedicationHistory] = useState<MedicationRecord[]>([]);

  // 開発用にBLE関連の処理を模倣するための仮の接続状態
  const [mockIsDeviceConnected, setMockIsDeviceConnected] = useState(true); // BLE接続画面からの連携を想定

  // BLEキャラクタリスティック監視のセットアップ (仮)
  // useEffect(() => {
  //   if (connectedDevice && bleManager) {
  //     const monitorOmikujiCharacteristic = async () => {
  //       try {
  //         await bleManager.monitorCharacteristicForDevice(
  //           connectedDevice.id,
  //           OMOKUJI_SERVICE_UUID,
  //           OMIKUJI_CHARACTERISTIC_UUID,
  //           (error, characteristic) => {
  //             if (error) {
  //               console.error("Monitor Error:", error.message);
  //               setOmikujiStatusMessage(`エラー: ${error.message}`);
  //               setIsOmikujiInProgress(false);
  //               return;
  //             }
  //             if (characteristic?.value) {
  //               // Base64デコードやデータ形式のパースはデバイスの仕様に合わせる
  //               // const rawData = atob(characteristic.value); // app/(tabs)/index.tsx での例
  //               // console.log("Received Omikuji Data (raw):", rawData);
  //               // const parsedResult = parseOmikujiData(rawData); // 独自のパーサー関数
  //               // processOmikujiResult(parsedResult);
  //
  //               // --- 以下はBLEデータ受信成功時の仮処理 ---
  //               const medicationNameFromDevice = "お薬A"; // デバイスから薬の名前を取得 (仮)
  //               const results = ['大吉', '吉', '小吉', '凶'] as const;
  //               const randomResult = results[Math.floor(Math.random() * results.length)];
  //               const points = randomResult === '大吉' ? 5 : randomResult === '吉' ? 3 : 1;
  //               processOmikujiResult({ medicationName: medicationNameFromDevice, result: randomResult, points });
  //               // --- 仮処理ここまで ---
  //             }
  //           }
  //         );
  //         console.log("おみくじキャラクタリスティックの監視を開始しました。");
  //       } catch (error) {
  //         console.error("Failed to monitor characteristic:", error);
  //         setOmikujiStatusMessage("おみくじ機能の準備に失敗しました。");
  //       }
  //     };
  //     monitorOmikujiCharacteristic();
  //     return () => {
  //       // bleManager.cancelCharacteristicMonitoring(connectedDevice.id, OMOKUJI_SERVICE_UUID, OMIKUJI_CHARACTERISTIC_UUID);
  //       console.log("おみくじキャラクタリスティックの監視を停止しました。");
  //     };
  //   }
  // }, [connectedDevice, bleManager]);


  const handleStartOmikuji = useCallback(() => {
    if (!mockIsDeviceConnected) { // 本来は `!connectedDevice`
      Alert.alert("エラー", "おみくじ箱が接続されていません。\n接続画面で接続してください。");
      return;
    }
    if (isOmikujiInProgress) return;

    setIsOmikujiInProgress(true);
    setOmikujiStatusMessage("おみくじ箱を振ってください...");
    setLastOmikujiResult(null);

    // --- BLE連携がない場合の仮のタイマー処理 ---
    // 実際のBLE連携では、このタイマーは不要で、デバイスからの通知を待ちます。
    setTimeout(() => {
      if (!isOmikujiInProgress) return; // 他の処理で既に完了または中止されている場合
      const medicationNameFromDevice = "いつものお薬"; // 仮の薬名
      const results = ['大吉', '吉', '小吉', '凶'] as const;
      const randomResult = results[Math.floor(Math.random() * results.length)];
      const points = randomResult === '大吉' ? 5 : randomResult === '吉' ? 3 : 1;
      processOmikujiResult({ medicationName: medicationNameFromDevice, result: randomResult, points });
    }, 3000); // 3秒後に結果を模倣
    // --- 仮のタイマー処理ここまで ---

    // TODO: 実際にBLEデバイスに「おみくじ開始」を通知する必要があれば、ここに書き込み処理を追加
  }, [mockIsDeviceConnected, isOmikujiInProgress]);


  const processOmikujiResult = useCallback(({ medicationName, result, points }: { medicationName: string, result: '大吉' | '吉' | '小吉' | '凶', points: number }) => {
    setOmikujiStatusMessage(`結果: ${medicationName} - ${result}！ (${points}ポイント獲得)`);
    const newRecord: MedicationRecord = {
      id: Date.now().toString(),
      type: 'regular',
      medicationName: medicationName,
      timestamp: new Date(),
      omikujiResult: result,
      pointsEarned: points,
    };
    setLastOmikujiResult(newRecord);
    setMedicationHistory(prev => [newRecord, ...prev]);
    // updateCharacterExperience(points); // キャラクターの経験値を更新 (Context経由)
    console.log(`${points}ポイント獲得。キャラクター経験値更新処理（仮）`);
    setIsOmikujiInProgress(false);
  }, []);


  const handleRecordSingleMedication = useCallback(() => {
    if (!singleMedicationName.trim()) {
      Alert.alert("入力エラー", "薬の名前を入力してください。");
      return;
    }
    const newRecord: MedicationRecord = {
      id: Date.now().toString(),
      type: 'single',
      medicationName: singleMedicationName.trim(),
      timestamp: new Date(),
      notes: singleMedicationNotes.trim(),
      pointsEarned: 1, // 単発薬でも固定ポイント
    };
    setMedicationHistory(prev => [newRecord, ...prev]);
    // updateCharacterExperience(1); // キャラクターの経験値を更新 (Context経由)
    console.log(`単発薬「${newRecord.medicationName}」を記録。1ポイント獲得（仮）`);
    setSingleMedicationName('');
    setSingleMedicationNotes('');
    Alert.alert("記録完了", `${newRecord.medicationName}を記録しました。`);
  }, [singleMedicationName, singleMedicationNotes]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>常備薬の記録（おみくじ）</Text>
          <Pressable
            style={[styles.buttonBase, styles.omikujiButton, isOmikujiInProgress && styles.buttonDisabled]}
            onPress={handleStartOmikuji}
            disabled={isOmikujiInProgress}>
            <Text style={styles.buttonText}>{isOmikujiInProgress ? "おみくじ実行中..." : "おみくじを引く"}</Text>
          </Pressable>
          {omikujiStatusMessage ? <Text style={styles.statusMessage}>{omikujiStatusMessage}</Text> : null}
          {lastOmikujiResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>おみくじ結果</Text>
              <Text>薬の名前: {lastOmikujiResult.medicationName}</Text>
              <Text>結果: {lastOmikujiResult.omikujiResult}</Text>
              <Text>獲得ポイント: {lastOmikujiResult.pointsEarned}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>単発薬の記録</Text>
          <TextInput
            style={styles.input}
            placeholder="薬の名前"
            value={singleMedicationName}
            onChangeText={setSingleMedicationName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="メモ (任意)"
            value={singleMedicationNotes}
            onChangeText={setSingleMedicationNotes}
            multiline
          />
          <Pressable
            style={[styles.buttonBase, styles.recordButton]}
            onPress={handleRecordSingleMedication}>
            <Text style={styles.buttonText}>この薬を記録する</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近の記録</Text>
          {medicationHistory.length === 0 ? (
            <Text style={styles.noHistoryText}>まだ記録がありません。</Text>
          ) : (
            medicationHistory.slice(0, 5).map(record => ( // 最新5件を表示
              <View key={record.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>{new Date(record.timestamp).toLocaleString('ja-JP')}</Text>
                <Text style={styles.historyName}>{record.medicationName} ({record.type === 'regular' ? '常備薬' : '単発薬'})</Text>
                {record.omikujiResult && <Text>おみくじ: {record.omikujiResult} ({record.pointsEarned}pt)</Text>}
                {record.notes && <Text style={styles.historyNotes}>メモ: {record.notes}</Text>}
              </View>
            ))
          )}
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
    padding: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    // Android Shadow
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    // Android Shadow
    elevation: 3,
  },
  omikujiButton: {
    backgroundColor: '#FF6347', // トマト色
  },
  recordButton: {
    backgroundColor: '#1E90FF', // ドジャーブルー
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#AAAAAA',
  },
  statusMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  resultCard: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top', // Androidでテキストを上揃えに
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  noHistoryText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1E90FF',
  },
  historyDate: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  historyNotes: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },
});