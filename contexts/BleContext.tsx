// contexts/BleContext.tsx

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
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';

// ターゲットデバイス情報
const TARGET_DEVICE_NAME = "Hukuyakuji";
const OMOKUJI_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914a";
const OMIKUJI_EVENT_CHARACTERISTIC_UUID = "beefcafe-36e1-4688-b7f5-00000000000c";

// おみくじの結果定義
const OMIKUJI_RESULTS = [
    { title: "大吉", message: "5ptをゲット！\nジゴキシンは、心臓の力を強くするぞ！" },
    { title: "中吉", message: "4ptをゲット！\n副作用に気をつけながら、うまく使おう！" },
    { title: "小吉", message: "3ptをゲット！\n少しだけ成長した！" },
];

const MAX_STAGES = 3; // 背景の最大段階数

const bleManager = new BleManager();

// Contextの型定義
interface BleContextState {
    bleManagerInstance: BleManager;
    connectedDevice: Device | null;
    isScanning: boolean;
    isConnecting: boolean;
    connectionPhase: 'idle' | 'permission_denied' | 'scanning' | 'connecting' | 'connected' | 'error' | 'initializing';
    statusMessage: string;
    showShakePopup: boolean;
    omikujiResult: { title: string; message: string } | null;
    stageIndex: number; // キャラクターの成長段階
    shootParticles: () => void; // ★ パーティクルを発生させる関数を追加
    registerParticleShooter: (func: () => void) => void; // ★ パーティクルの実装を登録する関数を追加
    requestPermissions: () => Promise<boolean>;
    startScan: () => void;
    disconnectDevice: () => void;
    closeShakePopup: () => void;
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
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]);
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
    const [omikujiResult, setOmikujiResult] = useState<{ title: string; message: string } | null>(null);
    const [stageIndex, setStageIndex] = useState(0);

    // ★ パーティクル関連のstateと関数を追加
    const [particleShooter, setParticleShooter] = useState<{ shoot: () => void } | null>(null);

    const registerParticleShooter = useCallback((func: () => void) => {
        setParticleShooter({ shoot: func });
    }, []);

    const shootParticles = useCallback(() => {
        if (particleShooter) {
            particleShooter.shoot();
        }
    }, [particleShooter]);

    const disconnectSubscriptionRef = useRef<Subscription | null>(null);
    const shakeEventSubscriptionRef = useRef<Subscription | null>(null);

    const addLog = useCallback((message: string) => {
        console.log(`[BleContext] ${new Date().toLocaleTimeString()}: ${message}`);
    }, []);

    const advanceStage = useCallback(() => {
        setStageIndex(currentStage => Math.min(currentStage + 1, MAX_STAGES - 1));
    }, []);

    const requestPermissions = useCallback(async (): Promise<boolean> => {
        setConnectionPhase('initializing');
        setStatusMessage("権限を確認中...");
        const permissionsGranted = await requestBluetoothPermissionsAndroid();
        if (permissionsGranted) {
            addLog("Bluetooth権限が許可されました。");
            setConnectionPhase('idle');
            setStatusMessage("接続アイコンをタップしてください");
        } else {
            addLog("Bluetooth権限が拒否されました。");
            setConnectionPhase('permission_denied');
            setStatusMessage("Bluetoothの権限がありません。\n設定アプリから権限を許可してください。");
        }
        return permissionsGranted;
    }, [addLog]);

    // ★ ポップアップ表示時にパーティクルを発生させる
    useEffect(() => {
        if (showShakePopup) {
            shootParticles();
        }
    }, [showShakePopup, shootParticles]);

    useEffect(() => {
        const sub = bleManager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                requestPermissions();
            } else if (state === 'PoweredOff') {
                setConnectionPhase('error');
                setStatusMessage('Bluetoothがオフになっています。');
            }
        }, true);
        return () => sub.remove();
    }, [requestPermissions]);

    const monitorShakeEvents = useCallback((device: Device) => {
        if (shakeEventSubscriptionRef.current) {
            shakeEventSubscriptionRef.current.remove();
        }
        addLog(`シェイクイベントの監視を開始: ${device.id}`);
        shakeEventSubscriptionRef.current = bleManager.monitorCharacteristicForDevice(
            device.id, OMOKUJI_SERVICE_UUID, OMIKUJI_EVENT_CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    addLog(`シェイクイベント監視エラー: ${error.message}`);
                    return;
                }
                if (characteristic?.value) {
                    const receivedData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
                    addLog(`シェイクイベント受信: ${receivedData}`);
                    if (receivedData.trim() === "shake") {
                        const result = OMIKUJI_RESULTS[Math.floor(Math.random() * OMIKUJI_RESULTS.length)];
                        setOmikujiResult(result);
                        setShowShakePopup(true);
                    }
                }
            }
        );
    }, [addLog]);

    const connectToDevice = useCallback(async (deviceToConnect: Device) => {
        if (isConnecting || connectedDevice) return;

        addLog(`「${deviceToConnect.name || deviceToConnect.id}」に接続中...`);
        setIsConnecting(true);
        setConnectionPhase('connecting');
        setStatusMessage(`「${deviceToConnect.name || 'おみくじ箱'}」に接続しています...`);

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
            setIsConnecting(false);
            setConnectionPhase('error');
            setStatusMessage(`接続に失敗しました`);
            setConnectedDevice(null);
        }
    }, [isConnecting, connectedDevice, addLog, monitorShakeEvents]);

    const startScan = useCallback(() => {
        if (isScanning || isConnecting || connectionPhase === 'permission_denied' || connectionPhase === 'connected') {
            return;
        }

        addLog("デバイススキャンを開始...");
        setIsScanning(true);
        setConnectionPhase('scanning');
        setStatusMessage("おみくじ箱を探しています...");

        bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                addLog(`スキャンエラー: ${error.message}`);
                setStatusMessage(`スキャンエラー: ${error.message}`);
                setIsScanning(false);
                setConnectionPhase('error');
                return;
            }

            if (scannedDevice && scannedDevice.name === TARGET_DEVICE_NAME) {
                addLog(`ターゲットデバイス「${TARGET_DEVICE_NAME}」を発見。`);
                bleManager.stopDeviceScan();
                setIsScanning(false);
                connectToDevice(scannedDevice);
            }
        });

        setTimeout(() => {
            if (isScanning) {
                bleManager.stopDeviceScan();
                setIsScanning(false);
                if (connectionPhase === 'scanning') {
                    addLog("スキャンタイムアウト。");
                    setConnectionPhase('idle');
                    setStatusMessage("おみくじ箱が見つかりませんでした。\n再度お試しください。");
                }
            }
        }, 15000);
    }, [isScanning, isConnecting, connectionPhase, connectToDevice, addLog]);

    const disconnectDevice = useCallback(() => {
        if (connectedDevice) {
            addLog(`「${connectedDevice.name || connectedDevice.id}」から切断します...`);
            shakeEventSubscriptionRef.current?.remove();
            connectedDevice.cancelConnection().catch(e => addLog(`切断時エラー: ${e.message}`));
        }
    }, [connectedDevice, addLog]);

    useEffect(() => {
        if (connectedDevice) {
            disconnectSubscriptionRef.current = bleManager.onDeviceDisconnected(
                connectedDevice.id,
                (error, disconnectedDev) => {
                    addLog(`デバイス「${disconnectedDev?.name}」が切断されました。`);
                    setConnectedDevice(null);
                    setIsConnecting(false);
                    shakeEventSubscriptionRef.current?.remove();
                    setConnectionPhase('idle');
                    setStatusMessage("接続が切れました。再度接続してください。");
                }
            );
        }
        return () => {
            disconnectSubscriptionRef.current?.remove();
        };
    }, [connectedDevice, addLog]);

    useEffect(() => () => {
        addLog("BleProviderアンマウント。BleManagerを破棄します。");
        bleManager.destroy();
    }, [addLog]);

    const closeShakePopup = () => {
        setShowShakePopup(false);
        setOmikujiResult(null);
        advanceStage();
    };

    const contextValue: BleContextState = {
        bleManagerInstance: bleManager,
        connectedDevice,
        isScanning,
        isConnecting,
        connectionPhase,
        statusMessage,
        showShakePopup,
        omikujiResult,
        stageIndex,
        shootParticles,
        registerParticleShooter,
        requestPermissions,
        startScan,
        disconnectDevice,
        closeShakePopup,
    };

    return (
        <BleContext.Provider value={contextValue}>
            {children}
        </BleContext.Provider>
    );
};