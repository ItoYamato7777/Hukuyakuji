import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';

// BleManagerのインスタンスはコンポーネント外で作成
const bleManager = new BleManager();

// ターゲットデバイス名（実際の名前に置き換えてください）
// この値は設定ファイルやContext API経由で管理することも可能です。
const TARGET_DEVICE_NAME = "Hukuyakuji";

// AndroidのBluetooth権限要求関数 (Android 12対応)
async function requestBluetoothPermissionsAndroid() {
  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version as number;
    try {
      if (apiLevel < 31) { // Android 11 (API 30) 以前
        const coarseLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, // または ACCESS_FINE_LOCATION
          {
            title: "位置情報権限（Bluetoothスキャン用）",
            message: "Bluetoothデバイスをスキャンするために位置情報権限が必要です。",
            buttonPositive: "OK",
          }
        );
        return coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else { // Android 12 (API 31) 以降
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          // ACCESS_FINE_LOCATION は、Bluetoothスキャンで物理的な場所を取得しない場合は不要なことがあります。
          // 必要に応じて追加・削除してください。
          // PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allPermissionsGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );
        return allPermissionsGranted;
      }
    } catch (err) {
      console.warn("[Permissions Error]", err);
      return false;
    }
  }
  return true; // iOSの場合はInfo.plistでの設定が主
}


export default function BluetoothConnectionScreen() {
  const router = useRouter();
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("おみくじ箱に接続してください");
  // 'idle', 'permission_denied', 'scanning', 'connecting', 'connected', 'error'
  const [connectionPhase, setConnectionPhase] = useState<'idle' | 'permission_denied' | 'scanning' | 'connecting' | 'connected' | 'error'>('idle');

  const deviceRef = useRef<Device | null>(null);
  const disconnectSubscriptionRef = useRef<Subscription | null>(null);

  const addLog = useCallback((message: string) => { // 開発中のデバッグ用
    console.log(`[BLE Status] ${new Date().toLocaleTimeString()}: ${message}`);
  }, []);

  // BLE初期化と権限要求
  useEffect(() => {
    const initialize = async () => {
      const permissionsGranted = await requestBluetoothPermissionsAndroid();
      if (permissionsGranted) {
        addLog("Bluetooth権限が許可されました。");
        setConnectionPhase('idle');
        setStatusMessage("おみくじ箱に接続してください");
      } else {
        addLog("Bluetooth権限が拒否されました。");
        setConnectionPhase('permission_denied');
        setStatusMessage("Bluetoothの権限がありません。\n設定アプリから権限を許可してください。");
      }
    };
    initialize();

    // アンマウント時のクリーンアップ
    return () => {
      addLog("Bluetooth接続画面を離れます。スキャンを停止し、可能な場合は接続を解除します。");
      bleManager.stopDeviceScan();
      if (disconnectSubscriptionRef.current) {
        disconnectSubscriptionRef.current.remove();
      }
      // この画面を離れる際に常に切断するかどうかは要件による
      // if (deviceRef.current && deviceRef.current.isConnected()) {
      //   deviceRef.current.cancelConnection().catch(err => addLog(`自動切断エラー: ${err.message}`));
      // }
    };
  }, [addLog]);

  // デバイス切断時のイベントリスナー設定
  useEffect(() => {
    if (connectedDevice) {
      disconnectSubscriptionRef.current = bleManager.onDeviceDisconnected(
        connectedDevice.id,
        (error, disconnectedDev) => {
          addLog(`デバイス「${disconnectedDev?.name || disconnectedDev?.id}」が切断されました。${error ? `エラー: ${error.message}` : ''}`);
          setConnectedDevice(null);
          deviceRef.current = null;
          setIsConnecting(false);
          setConnectionPhase('idle');
          setStatusMessage("接続が切れました。再度接続してください。");
        }
      );
    }
    return () => {
      if (disconnectSubscriptionRef.current) {
        disconnectSubscriptionRef.current.remove();
      }
    };
  }, [connectedDevice, addLog]);


  const startScanAndConnect = () => {
    if (isScanning || isConnecting) return;

    addLog("デバイススキャンを開始...");
    setIsScanning(true);
    setConnectionPhase('scanning');
    setStatusMessage("おみくじ箱を探しています...");

    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        addLog(`スキャンエラー: ${error.message}`);
        bleManager.stopDeviceScan();
        setIsScanning(false);
        setConnectionPhase('error');
        setStatusMessage(`スキャンエラー: ${error.message}`);
        return;
      }

      if (scannedDevice) {
        addLog(`デバイス発見: ${scannedDevice.name || "Unknown"} (${scannedDevice.id})`);
        if (scannedDevice.name === TARGET_DEVICE_NAME) {
          addLog(`ターゲットデバイス「${TARGET_DEVICE_NAME}」を発見。スキャンを停止します。`);
          bleManager.stopDeviceScan();
          setIsScanning(false);
          connectToDeviceInternal(scannedDevice);
        }
      }
    });

    // スキャンタイムアウト処理（例: 20秒）
    setTimeout(() => {
      if (isScanning && connectionPhase === 'scanning') { //  `isScanning` がtrueのままであればタイムアウトと判断
        bleManager.stopDeviceScan();
        setIsScanning(false);
        addLog("スキャンタイムアウト。");
        setConnectionPhase('idle'); // または 'error'
        setStatusMessage("おみくじ箱が見つかりませんでした。\n再度お試しください。");
      }
    }, 20000);
  };

  const connectToDeviceInternal = (deviceToConnect: Device) => {
    addLog(`「${deviceToConnect.name || deviceToConnect.id}」に接続中...`);
    setIsConnecting(true);
    setConnectionPhase('connecting');
    setStatusMessage(`「${deviceToConnect.name || 'おみくじ箱'}」に接続しています...`);
    deviceRef.current = deviceToConnect;

    deviceToConnect.connect({ autoConnect: false, requestMTU: 251 }) // MTUサイズはデバイスに合わせて調整
      .then((connectedDev) => {
        addLog(`「${connectedDev.name || connectedDev.id}」に接続成功。サービスを検索します...`);
        // オプション: サービスとキャラクタリスティックの探索
        // return connectedDev.discoverAllServicesAndCharacteristics();
        //})
        //.then((deviceWithServices) => {
        //  addLog("サービスとキャラクタリスティックの探索完了。");
        setConnectedDevice(connectedDev);
        setIsConnecting(false);
        setConnectionPhase('connected');
        setStatusMessage(`「${connectedDev.name || 'おみくじ箱'}」に接続しました！`);
        // TODO: 接続情報をグローバルステートに保存する (Context APIやZustand/Reduxなど)
        // router.replace('/(tabs)/home'); // すぐに遷移せず、ユーザーに確認ボタンを押させるのも良い
      })
      .catch(error => {
        addLog(`接続エラー (${deviceToConnect.name}): ${error.message}`);
        deviceRef.current = null;
        setIsConnecting(false);
        setConnectionPhase('error');
        setStatusMessage(`接続に失敗しました: ${error.message}`);
      });
  };

  const handleDisconnect = () => {
    if (connectedDevice) {
      addLog(`「${connectedDevice.name || connectedDevice.id}」から切断します...`);
      connectedDevice.cancelConnection()
        .then(() => {
          addLog("切断成功。");
          // setConnectedDevice(null) などは onDeviceDisconnected で処理される
        })
        .catch(error => {
          addLog(`切断エラー: ${error.message}`);
          // 強制的に状態を更新
          setConnectedDevice(null);
          deviceRef.current = null;
          setIsConnecting(false);
          setConnectionPhase('idle');
          setStatusMessage("切断処理中にエラーが発生しました。");
        });
    }
  };

  const navigateToHome = () => {
    if (isScanning) { // スキャン中にスキップする場合は停止
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }
    router.replace('/(tabs)/home');
  };

  const getIndicatorStyle = () => {
    const style = [styles.statusIndicator];
    switch (connectionPhase) {
      case 'idle':
      case 'permission_denied':
        style.push({ backgroundColor: '#E0E0E0' }); // ライトグレー
        break;
      case 'scanning':
        style.push({ backgroundColor: '#FFD700' }); // ゴールド（アニメーションで点滅させると良い）
        break;
      case 'connecting':
        style.push({ backgroundColor: '#FFA500' }); // オレンジ
        break;
      case 'connected':
        style.push({ backgroundColor: '#4CAF50' }); // 緑
        break;
      case 'error':
        style.push({ backgroundColor: '#F44336' }); // 赤
        break;
    }
    return style;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.appTitle}>薬×おみくじ箱</Text>
        {/* アプリのロゴやイラストを配置するスペース */}
        {/* <Image source={require('@/assets/images/app-logo.png')} style={styles.logo} /> */}

        <View style={getIndicatorStyle()} />
        <Text style={styles.statusMessageText}>{statusMessage}</Text>

        {isScanning || isConnecting ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.activityIndicator} />
        ) : null}

        {connectionPhase === 'connected' && connectedDevice ? (
          <View style={styles.buttonGroup}>
            <Pressable style={[styles.buttonBase, styles.primaryButton]} onPress={navigateToHome}>
              <Text style={styles.buttonText}>ホームへ進む</Text>
            </Pressable>
            <Pressable style={[styles.buttonBase, styles.secondaryButton, { marginTop: 15 }]} onPress={handleDisconnect}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>「{connectedDevice.name || TARGET_DEVICE_NAME}」から切断</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.buttonBase, styles.primaryButton]}
              onPress={startScanAndConnect}
              disabled={isScanning || isConnecting || connectionPhase === 'permission_denied'}>
              <Text style={styles.buttonText}>おみくじ箱に接続する</Text>
            </Pressable>
            <Pressable
              style={[styles.buttonBase, styles.secondaryButton, { marginTop: 15 }]}
              onPress={navigateToHome}
              disabled={isConnecting} // 接続試行中はスキップさせないなどの判断
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>接続せずに続ける</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5', // 少し明るい背景色
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30, // ロゴやイラストのスペースを考慮
    textAlign: 'center',
  },
  // logo: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 30 },
  statusIndicator: {
    width: 120,
    height: 120,
    borderRadius: 60, // 円形
    marginBottom: 25,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)', // 少し透明な白で縁取り
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    // Android Shadow
    elevation: 4,
  },
  statusMessageText: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    minHeight: 40, // 2行表示になってもレイアウトが崩れないように
    marginBottom: 30,
  },
  activityIndicator: {
    marginBottom: 20,
  },
  buttonGroup: {
    width: '90%',
    maxWidth: 350, // あまり横に広がりすぎないように
  },
  buttonBase: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25, // 角を丸くして柔らかい印象に
    alignItems: 'center',
    justifyContent: 'center',
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    // Android Shadow
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF', // iOS標準ブルー
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});