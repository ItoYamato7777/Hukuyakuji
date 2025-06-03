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
import { useBle } from '@/context/BleContext'; // BleContextを使用

// 仮の型定義 (変更なし)
interface MedicationRecord {
  id: string;
  type: 'regular' | 'single';
  medicationName: string;
  timestamp: Date;
  omikujiResult?: '大吉' | '吉' | '小吉' | '凶' | null;
  pointsEarned?: number;
  notes?: string;
}

export default function RecordScreen() {
  const { connectedDevice, showShakePopup, setOmikujiTrigger } = useBle(); // Contextから必要なものを取得

  // おみくじ関連のローカルState (結果表示用など)
  const [omikujiStatusMessage, setOmikujiStatusMessage] = useState('');
  const [lastOmikujiResult, setLastOmikujiResult] = useState<Partial<MedicationRecord> | null>(null);
  const [isOmikujiInProgress, setIsOmikujiInProgress] = useState(false); // 処理中フラグ

  // 単発薬関連のState (変更なし)
  const [singleMedicationName, setSingleMedicationName] = useState('');
  const [singleMedicationNotes, setSingleMedicationNotes] = useState('');
  const [medicationHistory, setMedicationHistory] = useState<MedicationRecord[]>([]);

  // --- おみくじ処理関数 ---
  const executeOmikuji = useCallback(() => {
    if (!connectedDevice) { // BLE接続がない場合は何もしない（ポップアップ自体表示されないはずだが念のため）
      Alert.alert("エラー", "おみくじ箱が接続されていません。");
      setOmikujiStatusMessage("エラー: デバイス未接続");
      return;
    }
    if (isOmikujiInProgress) return; // 多重実行防止

    setIsOmikujiInProgress(true);
    setOmikujiStatusMessage("おみくじ結果を生成中...");
    setLastOmikujiResult(null);

    // ここで実際のおみくじ結果生成ロジック（以前のsetTimeoutの部分をベースに）
    // setTimeoutはデモ用。実際にはすぐに結果を生成してよい。
    const medicationNameFromDevice = "いつものお薬"; // 仮の薬名
    const results = ['大吉', '吉', '小吉', '凶'] as const;
    const randomResult = results[Math.floor(Math.random() * results.length)];
    const points = randomResult === '大吉' ? 5 : randomResult === '吉' ? 3 : 1;

    const newRecord: MedicationRecord = {
      id: Date.now().toString(),
      type: 'regular',
      medicationName: medicationNameFromDevice,
      timestamp: new Date(),
      omikujiResult: randomResult,
      pointsEarned: points,
    };

    setOmikujiStatusMessage(`結果: ${medicationNameFromDevice} - ${randomResult}！ (${points}ポイント獲得)`);
    setLastOmikujiResult(newRecord);
    setMedicationHistory(prev => [newRecord, ...prev.slice(0, 19)]); // 履歴は最新20件までなど調整
    // updateCharacterExperience(points); // キャラクターの経験値を更新 (Context経由または別方法で)
    console.log(`${points}ポイント獲得。キャラクター経験値更新処理（仮）`);
    setIsOmikujiInProgress(false);

  }, [connectedDevice, isOmikujiInProgress]);


  // --- BleContextにおみくじ処理のトリガーを登録 ---
  useEffect(() => {
    // RecordScreenが表示されている間、おみくじトリガーとしてexecuteOmikujiをセット
    setOmikujiTrigger(() => executeOmikuji);
    // クリーンアップ関数で、画面離脱時にトリガーを解除（nullをセット）
    return () => {
      setOmikujiTrigger(null);
    };
  }, [setOmikujiTrigger, executeOmikuji]);


  // 単発薬記録処理 (変更なし)
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
      pointsEarned: 1,
    };
    setMedicationHistory(prev => [newRecord, ...prev.slice(0, 19)]);
    console.log(`単発薬「${newRecord.medicationName}」を記録。1ポイント獲得（仮）`);
    setSingleMedicationName('');
    setSingleMedicationNotes('');
    Alert.alert("記録完了", `${newRecord.medicationName}を記録しました。`);
  }, [singleMedicationName, singleMedicationNotes]);


  // --- UI レンダリング ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>常備薬の記録（おみくじ）</Text>
          {!connectedDevice && (
            <Text style={styles.bleDisconnectedMessage}>
              おみくじ箱が接続されていません。ホーム画面で接続してください。
            </Text>
          )}
          {connectedDevice && (
            <Text style={styles.infoMessage}>
              おみくじ箱を振るとお薬を記録できます。
            </Text>
          )}
          {/* おみくじを引くボタンは不要になる (シェイクで起動のため) */}
          {/* <Pressable
            style={[styles.buttonBase, styles.omikujiButton, (!connectedDevice || isOmikujiInProgress) && styles.buttonDisabled]}
            onPress={handleStartOmikuji} // この関数は削除または役割変更
            disabled={!connectedDevice || isOmikujiInProgress}>
            <Text style={styles.buttonText}>{isOmikujiInProgress ? "おみくじ実行中..." : "おみくじを引く"}</Text>
          </Pressable> */}
          {omikujiStatusMessage ? <Text style={styles.statusMessage}>{omikujiStatusMessage}</Text> : null}
          {lastOmikujiResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>今回のおみくじ結果</Text>
              <Text>薬の名前: {lastOmikujiResult.medicationName}</Text>
              <Text>結果: {lastOmikujiResult.omikujiResult}</Text>
              <Text>獲得ポイント: {lastOmikujiResult.pointsEarned}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>単発薬の記録</Text>
          {/* ... (単発薬の入力フォームとボタンは変更なし) ... */}
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
          {/* ... (履歴表示部分は変更なし) ... */}
          {medicationHistory.length === 0 ? (
            <Text style={styles.noHistoryText}>まだ記録がありません。</Text>
          ) : (
            medicationHistory.slice(0, 5).map(record => (
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

// スタイル (一部追加・変更)
const styles = StyleSheet.create({
  // ... (既存のsafeArea, container, section, sectionTitle, input, textArea, buttonBase, recordButton, buttonText, divider, noHistoryText, historyItem, historyDate, historyName, historyNotes)
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  bleDisconnectedMessage: { // 追加
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  infoMessage: { // 追加
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  // omikujiButton: { // 不要になったのでコメントアウトまたは削除
  //   backgroundColor: '#FF6347',
  // },
  // buttonDisabled: {
  //   backgroundColor: '#AAAAAA',
  // },
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
    textAlignVertical: 'top',
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
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  recordButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});