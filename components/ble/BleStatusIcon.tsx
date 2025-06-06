// components/ble/BleStatusIcon.tsx

import { useBle } from '@/contexts/BleContext';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ICON_SIZE = 38;

export default function BleStatusIcon() {
    const { connectionPhase, startScan, disconnectDevice, statusMessage } = useBle();
    const rotation = useRef(new Animated.Value(0)).current;

    const isConnectingOrScanning = connectionPhase === 'connecting' || connectionPhase === 'scanning';

    useEffect(() => {
        if (isConnectingOrScanning) {
            Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotation.setValue(0);
        }
    }, [isConnectingOrScanning, rotation]);

    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handlePress = () => {
        if (connectionPhase === 'connected') {
            disconnectDevice();
        } else if (connectionPhase === 'idle' || connectionPhase === 'error') {
            startScan();
        }
    };

    const getIconSource = () => {
        if (connectionPhase === 'connected') {
            return require('@/assets/images/icon/ble_connected.png');
        }
        // 未接続・エラー・権限なしなど、接続済み以外はすべて未接続アイコン
        return require('@/assets/images/icon/ble_disconnected.png');
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.7}>
            {isConnectingOrScanning ? (
                <Animated.Image
                    source={require('@/assets/images/icon/ble_disconnected.png')} // ローディング中もベースアイコン表示
                    style={[styles.icon, { transform: [{ rotate }] }]}
                />
            ) : (
                <Image source={getIconSource()} style={styles.icon} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    icon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
    },
});