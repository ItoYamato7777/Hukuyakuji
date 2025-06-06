// components/ble/BleStatusIcon.tsx

import { useBle } from '@/contexts/BleContext';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity } from 'react-native';
// アイコンライブラリをインポートします
import { MaterialIcons } from '@expo/vector-icons';

const ICON_SIZE = 35; // アイコンサイズを少し調整
const CONNECTED_COLOR = 'gold';
const DISCONNECTED_COLOR = '#8e8e8e'; // 少し濃いめのグレー

export default function BleStatusIcon() {
    const { connectionPhase, startScan, disconnectDevice } = useBle();
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
            // アニメーションを停止し、値をリセット
            rotation.stopAnimation();
            rotation.setValue(0);
        }
    }, [isConnectingOrScanning, rotation]);

    const rotateStyle = {
        transform: [
            {
                rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                }),
            },
        ],
    };

    const handlePress = () => {
        // 接続中・スキャン中はボタンを無効化
        if (isConnectingOrScanning) return;

        if (connectionPhase === 'connected') {
            disconnectDevice();
        } else {
            startScan();
        }
    };

    const renderIcon = () => {
        if (isConnectingOrScanning) {
            return (
                <Animated.View style={rotateStyle}>
                    <MaterialIcons name="bluetooth" size={ICON_SIZE} color={DISCONNECTED_COLOR} />
                </Animated.View>
            );
        }

        if (connectionPhase === 'connected') {
            return <MaterialIcons name="bluetooth" size={ICON_SIZE} color={CONNECTED_COLOR} />;
        }

        // その他の状態 (idle, error, permission_denied)
        return <MaterialIcons name="bluetooth-disabled" size={ICON_SIZE} color={DISCONNECTED_COLOR} />;
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.7}>
            {renderIcon()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        paddingTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});