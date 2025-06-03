import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useBle } from '@/context/BleContext'; // BleContextからuseBleフックをインポート

// キャラクターデータ型と初期データ (変更なし)
interface CharacterData {
    id: string;
    name: string;
    level: number;
    experience: number;
    maxExperience: number;
    imageUri: any;
    status: 'idle' | 'hungry' | 'waiting_med' | 'happy';
    greeting: string;
}

const initialCharacterData: CharacterData = {
    id: 'kamisama_001',
    name: 'おくすり神',
    level: 1,
    experience: 30,
    maxExperience: 100,
    imageUri: require('@/assets/images/default_character.png'), // 画像パスはプロジェクトに合わせてください
    status: 'idle',
    greeting: 'こんにちは！お薬、ちゃんと飲んでるかな？',
};

const statusIcons = {
    idle: '☀️',
    hungry: '🍲',
    waiting_med: '💊',
    happy: '😊',
};

export default function HomeScreen() {
    const [character, setCharacter] = useState<CharacterData>(initialCharacterData);
    const [showGreeting, setShowGreeting] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    // --- BleContextからBLE関連の状態と関数を取得 ---
    const {
        connectedDevice,
        isScanning,
        isConnecting,
        connectionPhase,
        statusMessage,
        startScan,
        disconnectDevice,
        // requestPermissions, // requestPermissionsはContextの初期化時に実行されるため、ここでは通常不要
    } = useBle();

    // --- キャラクターアニメーション (既存) ---
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(animation, { toValue: -1, duration: 1500, useNativeDriver: true }),
                Animated.timing(animation, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, [animation]);

    const handleCharacterPress = () => {
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 2000);
    };

    const getExperiencePercentage = () => (character.experience / character.maxExperience) * 100;

    const getBackgroundColor = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return bleStyles.backgroundMorning;
        if (hour >= 12 && hour < 18) return bleStyles.backgroundDay;
        if (hour >= 18 && hour < 22) return bleStyles.backgroundEvening;
        return bleStyles.backgroundNight;
    };

    // --- BLE接続UIのレンダリング ---
    const renderBleConnectionArea = () => {
        // 権限要求はContextの初期化時に行われるので、ここではボタン表示を制御
        // const handleRequestPermissions = async () => {
        //   const granted = await requestPermissions();
        //   if (granted) {
        //     // 権限が付与された後の処理 (例: 自動スキャン開始など)
        //   }
        // };

        return (
            <View style={bleStyles.bleContainer}>
                <View style={[bleStyles.statusIndicator, getIndicatorStyle()]} />
                <Text style={bleStyles.statusMessageText} numberOfLines={2} ellipsizeMode="tail">{statusMessage}</Text>

                {(isScanning || isConnecting) && ( // 接続中もインジケーター表示を考慮
                    <ActivityIndicator size="large" color="#007AFF" style={bleStyles.activityIndicator} />
                )}

                {connectionPhase === 'connected' && connectedDevice ? (
                    <Pressable style={[bleStyles.buttonBase, bleStyles.disconnectButton]} onPress={disconnectDevice}>
                        <Text style={[bleStyles.buttonText, bleStyles.disconnectButtonText]}>「{connectedDevice.name || "接続デバイス"}」から切断</Text>
                    </Pressable>
                ) : connectionPhase !== 'initializing' && connectionPhase !== 'permission_denied' ? ( // 初期化中と権限拒否時以外に接続ボタン表示
                    <Pressable
                        style={[bleStyles.buttonBase, bleStyles.connectButton, (isScanning || isConnecting) ? bleStyles.buttonDisabled : {}]}
                        onPress={startScan}
                        disabled={isScanning || isConnecting || connectionPhase === 'connected'}>
                        <Text style={bleStyles.buttonText}>おみくじ箱に接続</Text>
                    </Pressable>
                ) : null}
                 {connectionPhase === 'permission_denied' && (
                    <View style={bleStyles.permissionDeniedContainer}>
                        <Text style={bleStyles.permissionDeniedText}>
                            Bluetoothと位置情報の権限が必要です。
                        </Text>
                        {/* <Pressable style={[bleStyles.buttonBase, bleStyles.permissionButton]} onPress={handleRequestPermissions}>
                            <Text style={bleStyles.buttonText}>権限を再要求</Text>
                        </Pressable> */}
                         <Text style={bleStyles.permissionDeniedHelpText}>
                            アプリの設定画面から権限を許可してください。
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    const getIndicatorStyle = () => {
        switch (connectionPhase) {
            case 'idle':
                return { backgroundColor: '#E0E0E0' }; // アイドル時もグレー
            case 'permission_denied':
                return { backgroundColor: '#FF6347' }; // 権限拒否時は赤系（トマト）
            case 'scanning':
                return { backgroundColor: '#FFD700' };
            case 'connecting':
                return { backgroundColor: '#FFA500' };
            case 'connected':
                return { backgroundColor: '#4CAF50' };
            case 'error':
                return { backgroundColor: '#F44336' };
            case 'initializing':
                return { backgroundColor: '#A9A9A9' }; // 初期化中はダークグレー
            default:
                return { backgroundColor: '#E0E0E0' };
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, getBackgroundColor()]}>
            <View style={styles.container}>
                {/* BLE接続エリアを画面上部に配置 */}
                {renderBleConnectionArea()}

                {/* キャラクター情報エリア (既存) */}
                <View style={styles.characterInfoContainer}>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <View style={styles.levelContainer}>
                        <Text style={styles.levelText}>Lv. {character.level}</Text>
                        <View style={styles.experienceBarBackground}>
                            <View style={[styles.experienceBarFill, { width: `${getExperiencePercentage()}%` }]} />
                        </View>
                        <Text style={styles.experienceText}>{character.experience} / {character.maxExperience}</Text>
                    </View>
                    <Text style={styles.statusIcon}>{statusIcons[character.status]}</Text>
                </View>

                {/* キャラクター表示エリア (既存) */}
                <Pressable onPress={handleCharacterPress} style={styles.characterPressable}>
                    <Animated.View style={{
                        transform: [{
                            translateX: animation.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-10, 10]
                            })
                        }]
                    }}>
                        <Image source={character.imageUri} style={styles.characterImage} />
                    </Animated.View>
                    {showGreeting && (
                        <View style={styles.greetingBubble}>
                            <Text style={styles.greetingText}>{character.greeting}</Text>
                        </View>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

// 既存のホーム画面スタイル (変更なし)
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    characterInfoContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        width: '90%',
        maxWidth: 350,
        marginTop: 10,
    },
    characterName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    levelText: {
        fontSize: 15,
        color: '#555',
        marginRight: 8,
    },
    experienceBarBackground: {
        height: 8,
        width: 90,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 5,
    },
    experienceBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
    experienceText: {
        fontSize: 11,
        color: '#777',
    },
    statusIcon: {
        fontSize: 22,
        marginTop: 3,
    },
    characterPressable: {
        alignItems: 'center',
        position: 'relative',
        marginBottom: 20,
    },
    characterImage: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
    },
    greetingBubble: {
        position: 'absolute',
        bottom: -35,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    greetingText: {
        fontSize: 13,
        color: '#333',
    },
});

// BLE接続エリア用のスタイル (微調整)
const bleStyles = StyleSheet.create({
    bleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 10,
        marginBottom: 15,
    },
    statusIndicator: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        elevation: 2,
    },
    statusMessageText: {
        fontSize: 14,
        color: '#333333',
        textAlign: 'center',
        minHeight: 35, // 2行分の高さを確保
        marginBottom: 15,
        paddingHorizontal:10,
    },
    activityIndicator: {
        // marginBottom: 10, // ボタン表示時はボタンとの間にマージンができるので不要かも
    },
    buttonBase: {
        paddingVertical: 12, // 少し大きく戻す
        paddingHorizontal: 25,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        minWidth: 180,
    },
    connectButton: {
        backgroundColor: '#007AFF',
    },
    disconnectButton: {
        backgroundColor: '#FFFFFF',
        borderColor: '#DC3545',
        borderWidth: 1,
    },
    buttonDisabled: {
        backgroundColor: '#A9A9A9', // 無効化時の色
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    disconnectButtonText: {
        color: '#DC3545',
    },
    permissionDeniedContainer: { // 権限拒否時のメッセージとボタン用コンテナ
        alignItems: 'center',
        width: '90%',
    },
    permissionDeniedText: {
        fontSize: 13, // 少し大きく
        color: '#DC3545', //濃い赤
        textAlign: 'center',
        marginBottom: 5, // 次の行とのマージン
    },
    permissionDeniedHelpText: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
        marginTop: 5,
    },
    // permissionButton: { // 権限再要求ボタン（現在はコメントアウト）
    //   backgroundColor: '#FFA500', // オレンジ
    //   marginTop: 10,
    // },
    backgroundMorning: { backgroundColor: '#87CEEB' },
    backgroundDay: { backgroundColor: '#ADD8E6' },
    backgroundEvening: { backgroundColor: '#4682B4' },
    backgroundNight: { backgroundColor: '#000080' },
});