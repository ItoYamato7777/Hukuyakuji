import { useBle } from '@/context/BleContext';
import { useCharacter } from '@/context/CharacterContext'; // Character型もインポート
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// statusIconsはCharacterContext側で管理されても良いが、表示専用なのでこちらでもOK
const statusIcons = {
    idle: '☀️',
    hungry: '🍲',
    waiting_med: '💊',
    happy: '😊',
};

export default function HomeScreen() {
    // BLE ContextからBLE関連の状態と関数を取得 (変更なし)
    const {
        connectedDevice,
        isScanning,
        isConnecting,
        connectionPhase,
        statusMessage,
        startScan,
        disconnectDevice,
    } = useBle();

    // Character Contextからキャラクター情報とローディング状態を取得
    const { character, isLoading: isCharacterLoading } = useCharacter();

    const [showGreeting, setShowGreeting] = useState(false); // 挨拶表示用のローカルState
    const animation = useRef(new Animated.Value(0)).current; // アニメーション用のRef (変更なし)

    // キャラクターアニメーション (変更なし)
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
        if (character) { // characterがnullでないことを確認
            setShowGreeting(true);
            setTimeout(() => setShowGreeting(false), 2000);
        }
    };

    const getExperiencePercentage = () => {
        if (!character || character.maxExperience === 0) return 0; // characterやmaxExperienceが0の場合のガード
        return (character.experience / character.maxExperience) * 100;
    };

    const getBackgroundColor = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return bleStyles.backgroundMorning;
        if (hour >= 12 && hour < 18) return bleStyles.backgroundDay;
        if (hour >= 18 && hour < 22) return bleStyles.backgroundEvening;
        return bleStyles.backgroundNight;
    };

    // BLE接続UIのレンダリング (変更なし)
    const renderBleConnectionArea = () => {
        return (
            <View style={bleStyles.bleContainer}>
                <View style={[bleStyles.statusIndicator, getIndicatorStyle()]} />
                <Text style={bleStyles.statusMessageText} numberOfLines={2} ellipsizeMode="tail">{statusMessage}</Text>
                {(isScanning || isConnecting) && (
                    <ActivityIndicator size="large" color="#007AFF" style={bleStyles.activityIndicator} />
                )}
                {connectionPhase === 'connected' && connectedDevice ? (
                    <Pressable style={[bleStyles.buttonBase, bleStyles.disconnectButton]} onPress={disconnectDevice}>
                        <Text style={[bleStyles.buttonText, bleStyles.disconnectButtonText]}>「{connectedDevice.name || "接続デバイス"}」から切断</Text>
                    </Pressable>
                ) : connectionPhase !== 'initializing' && connectionPhase !== 'permission_denied' ? (
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
            case 'idle': return { backgroundColor: '#E0E0E0' };
            case 'permission_denied': return { backgroundColor: '#FF6347' };
            case 'scanning': return { backgroundColor: '#FFD700' };
            case 'connecting': return { backgroundColor: '#FFA500' };
            case 'connected': return { backgroundColor: '#4CAF50' };
            case 'error': return { backgroundColor: '#F44336' };
            case 'initializing': return { backgroundColor: '#A9A9A9' };
            default: return { backgroundColor: '#E0E0E0' };
        }
    };

    // キャラクターロード中の表示
    if (isCharacterLoading || !character) { // characterがnullの場合も考慮
        return (
            <SafeAreaView style={[styles.safeArea, styles.loadingContainer, getBackgroundColor()]}>
                <ActivityIndicator size="large" color={colorScheme === 'dark' ? "#FFFFFF" : "#000000"} />
                <Text style={styles.loadingText}>キャラクターを読み込み中...</Text>
            </SafeAreaView>
        );
    }
    // colorSchemeが未定義なので、仮の対応（実際にはuseColorSchemeをインポートするか、固定色にする）
    const colorScheme = 'light'; // 仮

    return (
        <SafeAreaView style={[styles.safeArea, getBackgroundColor()]}>
            <View style={styles.container}>
                {renderBleConnectionArea()}

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

                <Pressable onPress={handleCharacterPress} style={styles.characterPressable}>
                    <Animated.View style={{
                        transform: [{
                            translateX: animation.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-10, 10]
                            })
                        }]
                    }}>
                        {/* 画像URIはCharacterContextから供給されるものを使用 */}
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

// スタイル (ローディング関連のスタイルを追加)
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    loadingContainer: { // 追加
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: { // 追加
        marginTop: 10,
        fontSize: 16,
        // colorはgetBackgroundColorと合わせるか、テーマに応じて設定
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

// BLE接続エリア用のスタイル (変更なし)
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
        minHeight: 35,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    activityIndicator: {},
    buttonBase: {
        paddingVertical: 12,
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
        backgroundColor: '#A9A9A9',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    disconnectButtonText: {
        color: '#DC3545',
    },
    permissionDeniedContainer: {
        alignItems: 'center',
        width: '90%',
    },
    permissionDeniedText: {
        fontSize: 13,
        color: '#DC3545',
        textAlign: 'center',
        marginBottom: 5,
    },
    permissionDeniedHelpText: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
        marginTop: 5,
    },
    backgroundMorning: { backgroundColor: '#87CEEB' },
    backgroundDay: { backgroundColor: '#ADD8E6' },
    backgroundEvening: { backgroundColor: '#4682B4' },
    backgroundNight: { backgroundColor: '#000080' },
});