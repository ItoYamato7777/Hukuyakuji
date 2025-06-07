// app/_layout.tsx

import ShakeResultPopup from '@/components/ShakeResultPopup';
import { BleProvider, useBle } from '@/contexts/BleContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
// ★ DimensionsとStyleSheetをインポート
import { Dimensions, StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

SplashScreen.preventAutoHideAsync();

// 段階ごとのパーティクルの設定 (originを削除)
const PARTICLE_CONFIGS = [
    { count: 50, fallSpeed: 3000 },
    { count: 150, fallSpeed: 3000, explosionSpeed: 400 },
    { count: 250, fallSpeed: 3000, explosionSpeed: 500, colors: ["#ff0000", "#ffff00", "#0000ff"] },
];

function RootLayoutNav() {
    const { showShakePopup, closeShakePopup, omikujiResult, stageIndex, registerParticleShooter } = useBle();

    // ★ パーティクル表示用のstateを追加
    const [isCannonVisible, setIsCannonVisible] = useState(false);

    // ★ 画面サイズを取得
    const { width, height } = Dimensions.get('window');

    // パーティクルを再生する実際の関数をContextに登録
    useEffect(() => {
        // ★ 再生命令が来たら、表示状態をtrueにする
        registerParticleShooter(() => setIsCannonVisible(true));
    }, [registerParticleShooter]);

    const currentParticleConfig = PARTICLE_CONFIGS[stageIndex];

    // ★ アニメーション完了時に表示状態をfalseにする関数
    const handleAnimationEnd = () => {
        setIsCannonVisible(false);
    };

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} />
            <ShakeResultPopup
                visible={showShakePopup}
                onClose={closeShakePopup}
                result={omikujiResult}
            />

            {/* ★ isCannonVisibleがtrueの時だけパーティクルを描画 */}
            {isCannonVisible && (
                <View style={styles.particleContainer} pointerEvents="none">
                    <ConfettiCannon
                        // refは不要に
                        autoStart={true} // 表示されたら即時再生
                        onAnimationEnd={handleAnimationEnd} // ★ アニメーション完了時に非表示にする
                        count={currentParticleConfig.count}
                        // ★ 発生源を画面中央に設定
                        origin={{ x: width / 2, y: height / 2 }}
                        fallSpeed={currentParticleConfig.fallSpeed}
                        explosionSpeed={currentParticleConfig.explosionSpeed}
                        colors={currentParticleConfig.colors}
                    />
                </View>
            )}
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'A_P-OTF_PuhuPicnic_Min2-H': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <BleProvider>
            <RootLayoutNav />
        </BleProvider>
    );
}

const styles = StyleSheet.create({
    particleContainer: {
        // ★ 画面全体を覆うように設定
        ...StyleSheet.absoluteFillObject,
    },
});