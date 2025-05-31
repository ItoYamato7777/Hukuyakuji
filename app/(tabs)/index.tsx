import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  PermissionsAndroid,
  Platform, // Log表示用にScrollViewを追加
  SafeAreaView, // Buttonコンポーネントを追加
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import { atob } from "react-native-quick-base64";

// BleManagerのインスタンスはコンポーネント外で作成
const bleManager = new BleManager();

// ターゲットデバイス名とUUID（実際の値に置き換えてください）
const TARGET_DEVICE_NAME = "Hukuyakuji";
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914a"; //
const STEP_DATA_CHAR_UUID = "beefcafe-36e1-4688-b7f5-00000000000c"; //

// AndroidのBluetooth権限要求関数
async function requestBluetoothPermissions() {
  if (Platform.OS === 'android') {
    try {
      const coarseLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Location Permission for BLE",
          message: "App needs location permission to scan for Bluetooth devices.",
          buttonPositive: "OK",
        }
      );
      // Android 12 (API 31) 以降で必要な権限
      const scanGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: "Bluetooth Scan Permission",
          message: "App needs permission to scan for Bluetooth devices.",
          buttonPositive: "OK",
        }
      );
      const connectGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: "Bluetooth Connect Permission",
          message: "App needs permission to connect to Bluetooth devices.",
          buttonPositive: "OK",
        }
      );

      const allPermissionsGranted =
        coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        scanGranted === PermissionsAndroid.RESULTS.GRANTED &&
        connectGranted === PermissionsAndroid.RESULTS.GRANTED;

      if (allPermissionsGranted) {
        console.log("[Permissions] All Bluetooth permissions granted.");
        return true;
      } else {
        console.log("[Permissions] Some Bluetooth permissions were denied.");
        return false;
      }
    } catch (err) {
      console.warn("[Permissions] Error requesting permissions:", err);
      return false;
    }
  }
  // iOSの場合はInfo.plistでの設定が主
  return true;
}

export default function BleTestScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [Distance, setDistance] = useState<string | number>("N/A");

  const deviceRef = useRef<Device | null>(null);

  // ログ追加関数
  const addLog = (message: string) => {
    console.log(message);
    setLogs((prevLogs) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prevLogs.slice(0, 100), // ログは最新100件まで保持
    ]);
  };

  // BLE初期化と権限要求
  useEffect(() => {
    addLog("Initializing BLE...");
    requestBluetoothPermissions().then((granted) => {
      if (granted) {
        addLog("Bluetooth permissions granted. Ready to scan.");
      } else {
        addLog("Bluetooth permissions denied.");
      }
    });

    // コンポーネントのアンマウント時にBLEリソースをクリーンアップ
    return () => {
      addLog("Cleaning up BLE resources...");
      bleManager.stopDeviceScan();
      if (deviceRef.current) {
        deviceRef.current.cancelConnection().catch(err => addLog(`Error cancelling connection: ${err}`));
      }
      // bleManager.destroy(); // アプリ全体でBleManagerが不要になった時点で呼び出す
    };
  }, []);

  // デバイススキャン開始
  const startScan = () => {
    addLog("Starting device scan...");
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        addLog(`Scan Error: ${error.message}`);
        bleManager.stopDeviceScan();
        return;
      }
      if (scannedDevice) {
        addLog(`Found device: ${scannedDevice.name || "Unknown"} (${scannedDevice.id})`);
        if (scannedDevice.name === TARGET_DEVICE_NAME) {
          addLog(`Target device "${TARGET_DEVICE_NAME}" found. Stopping scan.`);
          bleManager.stopDeviceScan();
          connectToDevice(scannedDevice);
        }
      }
    });
  };

  // デバイス接続処理
  const connectToDevice = (device: Device) => {
    addLog(`Connecting to ${device.name || device.id}...`);
    deviceRef.current = device; // 接続試行前に参照を保存
    device.connect()
      .then((connectedDevice) => {
        addLog(`Connected to ${connectedDevice.name || connectedDevice.id}. Discovering services...`);
        setConnectedDevice(connectedDevice);
        deviceRef.current = connectedDevice; // 接続成功後、最新の参照に更新
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then((deviceWithServices) => {
        addLog("Services and characteristics discovered.");
        // 特定のキャラクタリスティックを監視
        monitorDistanceCharacteristic(deviceWithServices);
      })
      .catch((error) => {
        addLog(`Connection Error: ${error.message}`);
        setConnectedDevice(null);
        deviceRef.current = null; // 接続失敗時は参照をクリア
      });
  };

  // キャラクタリスティック監視
  const monitorDistanceCharacteristic = (device: Device) => {
    addLog(`Looking for service: ${SERVICE_UUID}`);
    device.services().then(services => {
      const service = services.find(s => s.uuid === SERVICE_UUID);
      if (!service) {
        addLog(`Service ${SERVICE_UUID} not found.`);
        return;
      }
      addLog(`Service ${SERVICE_UUID} found. Looking for characteristic: ${STEP_DATA_CHAR_UUID}`);
      service.characteristics().then(characteristics => {
        const characteristic = characteristics.find(c => c.uuid === STEP_DATA_CHAR_UUID);
        if (!characteristic) {
          addLog(`Characteristic ${STEP_DATA_CHAR_UUID} not found.`);
          return;
        }
        addLog(`Characteristic ${STEP_DATA_CHAR_UUID} found. Monitoring...`);
        characteristic.monitor((error, char) => {
          if (error) {
            addLog(`Monitor Error: ${error.message}`);
            return;
          }
          if (char && char.value) {
            const rawStepData = atob(char.value);
            addLog(`Received Step Data (raw): ${rawStepData}`);
            setDistance(rawStepData);
          }
        });
      }).catch(err => addLog(`Error finding characteristics: ${err.message}`));
    }).catch(err => addLog(`Error finding services: ${err.message}`));
  };

  // 切断処理
  const disconnectDevice = () => {
    if (connectedDevice) {
      addLog(`Disconnecting from ${connectedDevice.name || connectedDevice.id}...`);
      connectedDevice.cancelConnection()
        .then(() => {
          addLog("Disconnected successfully.");
        })
        .catch((error) => {
          addLog(`Disconnection Error: ${error.message}`);
        })
        .finally(() => {
          setConnectedDevice(null);
          deviceRef.current = null;
          setDistance("N/A");
        });
    } else {
      addLog("No device connected to disconnect.");
    }
  };

  // デバイス切断時のイベントリスナー
  useEffect(() => {
    if (!connectedDevice) return;

    const subscription = bleManager.onDeviceDisconnected(
      connectedDevice.id,
      (error, device) => {
        if (error) {
          addLog(`Device disconnected with error: ${error.message}`);
        } else {
          addLog(`Device ${device?.name || device?.id} disconnected.`);
        }
        setConnectedDevice(null);
        deviceRef.current = null;
        setDistance("N/A");
        // 必要であれば再接続処理などをここに追加
      }
    );
    return () => subscription.remove();
  }, [connectedDevice]);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>BLE Communication Test</Text>
        <View style={styles.statusContainer}>
          <Text>Status: {connectedDevice ? `Connected to ${connectedDevice.name || connectedDevice.id}` : "Disconnected"}</Text>
          <Text>Distance: {Distance}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Start Scan" onPress={startScan} disabled={!!connectedDevice} />
          <Button title="Disconnect" onPress={disconnectDevice} disabled={!connectedDevice} />
        </View>
        <Text style={styles.logTitle}>Logs:</Text>
        <ScrollView style={styles.logContainer} contentContainerStyle={styles.logContentContainer}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logContainer: {
    flex: 1,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 5,
  },
  logContentContainer: {
    paddingBottom: 10,
  },
  logText: {
    fontSize: 10,
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace", // 等幅フォントで見やすく
    marginBottom: 5,
  },
});