// BleContext.tsx

import { Buffer } from 'buffer';
import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from 'react';
import { PermissionsAndroid, Platform } from 'react-native'; // Alertはここで不要なら削除
import { BleError, BleManager, Characteristic, Device, Subscription } from 'react-native-ble-plx';

// ターゲットデバイス情報 (ESP32側の設定に合わせる)
const TARGET_DEVICE_NAME = "Hukuyakuji";
const OMOKUJI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914a";
const OMIKUJI_EVENT_CHARACTERISTIC_UUID = "beefcafe-36e1-4688-b7f5-00000000000c";

// BleManagerのインスタンスはContext内で管理
const bleManager = new BleManager();

interface BleContextState {
    bleManagerInstance: BleManager;
    connectedDevice: Device | null;
    isScanning: boolean;
    isConnecting: boolean;
    connectionPhase: 'idle' | 'permission_denied' | 'scanning' | 'connecting' | 'connected' | 'error' | 'initializing';
    statusMessage: string;
    showShakePopup: boolean;
    requestPermissions: () => Promise<boolean>;
    startScan: () => void;
    connectToDevice: (device: Device) => void;
    disconnectDevice: () => void;
    closeShakePopup: () => void;
    triggerOmikuji: (() => void) | null;
    setOmikujiTrigger: (callback: (() => void) | null) => void;
}

const BleContext = createContext<BleContextState | undefined>(undefined);

export const useBle = (): BleContextState => {
    const context = useContext(BleContext);
    if (!context) {
        throw new Error('useBle must be used within a BleProvider');
    }
    return context;
};

async function requestBluetoothPermissionsAndroid(): Promise<boolean> {
    if (Platform.OS === 'android') {
        const apiLevel = Platform.Version as number;
        try {
            if (apiLevel < 31) {
                const coarseLocationGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    {
                        title: "位置情報権限（Bluetoothスキャン用）",
                        message: "Bluetoothデバイスをスキャンするために位置情報権限が必要です。",
                        buttonPositive: "OK",
                    }
                );
                return coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ];
                const granted = await PermissionsAndroid.requestMultiple(permissions);
                return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
            }
        } catch (err) {
            console.warn("[Permissions Error]", err);
            return false;
        }
    }
    return true;
}

export const BleProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionPhase, setConnectionPhase] = useState<'idle' | 'permission_denied' | 'scanning' | 'connecting' | 'connected' | 'error' | 'initializing'>('initializing');
    const [statusMessage, setStatusMessage] = useState("BLE機能を初期化中...");
    const [showShakePopup, setShowShakePopup] = useState(false);
    const [triggerOmikuji, setTriggerOmikuji] = useState<(() => void) | null>(null);

    const deviceRef = useRef<Device | null>(null);
    const disconnectSubscriptionRef = useRef<Subscription | null>(null);
    const shakeEventSubscriptionRef = useRef<Subscription | null>(null);

    const addLog = useCallback((message: string) => {
        console.log(`[BleContext] ${new Date().toLocaleTimeString()}: ${message}`);
    }, []);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        setConnectionPhase('initializing');
        setStatusMessage("権限を確認中...");
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
        return permissionsGranted;
    }, [addLog]);

    useEffect(() => {
        requestPermissions();
    }, [requestPermissions]);

    const monitorShakeEvents = useCallback(async (device: Device) => {
        if (shakeEventSubscriptionRef.current) {
            shakeEventSubscriptionRef.current.remove();
        }
        addLog(`シェイクイベントの監視を開始: ${device.id}`);
        shakeEventSubscriptionRef.current = bleManager.monitorCharacteristicForDevice(
            device.id,
            OMOKUJI_SERVICE_UUID,
            OMIKUJI_EVENT_CHARACTERISTIC_UUID,
            (error: BleError | null, characteristic: Characteristic | null) => {
                if (error) {
                    addLog(`シェイクイベント監視エラー: ${error.message} (code: ${error.errorCode})`);
                    if (error.errorCode === 201 || error.reason?.includes("is not connected")) {
                        addLog("デバイスが切断されたため、シェイク監視を停止します。");
                        if (connectedDeviceRef.current && connectedDeviceRef.current.id === device.id) {
                            // 状態更新は onDeviceDisconnected に集約
                        }
                    }
                    return;
                }
                if (characteristic?.value) {
                    const receivedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
                    addLog(`シェイクイベント受信: ${receivedData}`);
                    if (receivedData.trim() === "shake") {
                        setShowShakePopup(true);
                    }
                }
            },
            `monitorShake-${device.id}`
        );
    }, [addLog]); // connectedDeviceRef を依存配列から削除し、connectedDeviceRef.current を使用していることを確認

    const connectToDevice = useCallback(async (deviceToConnect: Device) => {
        if (isConnecting || connectedDeviceRef.current) return; // connectedDeviceRef.current を使用

        addLog(`「${deviceToConnect.name || deviceToConnect.id}」に接続中...`);
        setIsConnecting(true);
        setConnectionPhase('connecting');
        setStatusMessage(`「${deviceToConnect.name || 'おみくじ箱'}」に接続しています...`);
        deviceRef.current = deviceToConnect;

        try {
            const connectedDev = await deviceToConnect.connect({ autoConnect: false, requestMTU: 50 });
            addLog(`「${connectedDev.name || connectedDev.id}」に接続成功。サービスを検索します...`);
            await connectedDev.discoverAllServicesAndCharacteristics();
            addLog("サービスとキャラクタリスティックの探索完了。");

            setConnectedDevice(connectedDev);
            setIsConnecting(false);
            setConnectionPhase('connected');
            setStatusMessage(`「${connectedDev.name || 'おみくじ箱'}」に接続しました！`);
            monitorShakeEvents(connectedDev);

        } catch (error: any) {
            addLog(`接続エラー (${deviceToConnect.name}): ${error.message}`);
            deviceRef.current = null;
            setIsConnecting(false);
            setConnectionPhase('error');
            setStatusMessage(`接続に失敗しました: ${error.message}`);
            setConnectedDevice(null);
        }
    }, [addLog, monitorShakeEvents, isConnecting]); // connectedDeviceRef を依存配列から削除

    const startScan = useCallback(() => {
        if (isScanningRef.current || isConnectingRef.current || connectionPhaseRef.current === 'permission_denied' || connectionPhaseRef.current === 'connected') { // Refを使用
            addLog(`スキャン開始不可: isScanning=${isScanningRef.current}, isConnecting=${isConnectingRef.current}, phase=${connectionPhaseRef.current}`);
            return;
        }

        addLog("デバイススキャンを開始...");
        setIsScanning(true);
        setConnectionPhase('scanning');
        setStatusMessage("おみくじ箱を探しています...");

        bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, scannedDevice) => {
            if (error) {
                addLog(`スキャンエラー: ${error.message}`);
                if (error.message.includes("BLE Park source is unavailable")) {
                    setStatusMessage(`スキャンエラー: Bluetoothがオフになっているか、利用できません。`);
                } else {
                    setStatusMessage(`スキャンエラー: ${error.message}`);
                }
                bleManager.stopDeviceScan();
                setIsScanning(false);
                setConnectionPhase('error');
                return;
            }

            if (scannedDevice) {
                addLog(`デバイス発見: ${scannedDevice.name || "Unknown"} (${scannedDevice.id})`);
                if (scannedDevice.name === TARGET_DEVICE_NAME) {
                    addLog(`ターゲットデバイス「${TARGET_DEVICE_NAME}」を発見。スキャンを停止します。`);
                    bleManager.stopDeviceScan();
                    setIsScanning(false);
                    connectToDevice(scannedDevice);
                }
            }
        });

        setTimeout(() => {
            if (isScanningRef.current) {
                bleManager.stopDeviceScan();
                setIsScanning(false);
                if (connectionPhaseRef.current === 'scanning' && !connectedDeviceRef.current) {
                    addLog("スキャンタイムアウト。");
                    setConnectionPhase('idle');
                    setStatusMessage("おみくじ箱が見つかりませんでした。\n再度お試しください。");
                }
            }
        }, 20000);
    }, [connectToDevice, addLog]); // isConnecting, connectionPhase, isScanning を依存配列から削除

    const isScanningRef = useRef(isScanning);
    useEffect(() => { isScanningRef.current = isScanning; }, [isScanning]);
    const isConnectingRef = useRef(isConnecting);
    useEffect(() => { isConnectingRef.current = isConnecting; }, [isConnecting]);
    const connectionPhaseRef = useRef(connectionPhase);
    useEffect(() => { connectionPhaseRef.current = connectionPhase; }, [connectionPhase]);
    const connectedDeviceRef = useRef(connectedDevice);
    useEffect(() => { connectedDeviceRef.current = connectedDevice; }, [connectedDevice]);

    const disconnectDevice = useCallback(() => {
        if (connectedDeviceRef.current) { // Refを使用
            addLog(`「${connectedDeviceRef.current.name || connectedDeviceRef.current.id}」から切断します...`);
            if (shakeEventSubscriptionRef.current) {
                shakeEventSubscriptionRef.current.remove();
                shakeEventSubscriptionRef.current = null;
                addLog("シェイクイベント監視を解除しました。");
            }
            connectedDeviceRef.current.cancelConnection()
                .then(() => {
                    addLog("切断成功。");
                })
                .catch((error: any) => {
                    addLog(`切断エラー: ${error.message}`);
                    setConnectedDevice(null);
                    deviceRef.current = null; // deviceRefもクリア
                    setIsConnecting(false);
                    setConnectionPhase('idle');
                    setStatusMessage("切断処理中にエラーが発生しました。");
                });
        }
    }, [addLog]); // connectedDeviceRef を依存配列から削除

    useEffect(() => {
        if (connectedDevice) { // ここは connectedDevice のままで良い
            disconnectSubscriptionRef.current = bleManager.onDeviceDisconnected(
                connectedDevice.id,
                (error: BleError | null, disconnectedDev: Device | null) => {
                    addLog(`デバイス「${disconnectedDev?.name || disconnectedDev?.id}」が切断されました。${error ? `エラー: ${error.message}` : ''}`);
                    setConnectedDevice(null);
                    deviceRef.current = null;
                    setIsConnecting(false);
                    if (shakeEventSubscriptionRef.current) {
                        shakeEventSubscriptionRef.current.remove();
                        shakeEventSubscriptionRef.current = null;
                    }
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

    useEffect(() => {
        return () => {
            addLog("BleProviderアンマウント。BleManagerを破棄します。");
            bleManager.destroy();
        };
    }, [addLog]);

    const closeShakePopup = () => {
        setShowShakePopup(false);
        if (triggerOmikujiRef.current) { // Refを使用
            triggerOmikujiRef.current();
        }
    };

    const setOmikujiTriggerCallback = useCallback((callback: (() => void) | null) => {
        setTriggerOmikuji(() => callback);
    }, []); // setTriggerOmikuji は依存配列に不要

    const triggerOmikujiRef = useRef(triggerOmikuji);
    useEffect(() => {
        triggerOmikujiRef.current = triggerOmikuji;
    }, [triggerOmikuji]);

    const contextValue: BleContextState = {
        bleManagerInstance: bleManager,
        connectedDevice,
        isScanning,
        isConnecting,
        connectionPhase,
        statusMessage,
        showShakePopup,
        requestPermissions,
        startScan,
        connectToDevice,
        disconnectDevice,
        closeShakePopup,
        triggerOmikuji, // Contextに含める
        setOmikujiTrigger: setOmikujiTriggerCallback, // Contextに含める
    };

    return (
        <BleContext.Provider value={contextValue}>
            {children}
        </BleContext.Provider>
    );
};