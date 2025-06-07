// app/_layout.tsx

import ShakeResultPopup from '@/components/ShakeResultPopup';
import { BleProvider, useBle } from '@/contexts/BleContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

SplashScreen.preventAutoHideAsync();

// 段階ごとのパーティクルの設定
const PARTICLE_CONFIGS = [
    { count: 50, origin: { x: -10, y: 0 }, fallSpeed: 3000 },
    { count: 150, origin: { x: -10, y: 0 }, fallSpeed: 3000, explosionSpeed: 400 },
    { count: 250, origin: { x: -10, y: 0 }, fallSpeed: 3000, explosionSpeed: 500, colors: ["#ff0000", "#ffff00", "#0000ff"] },
];

function RootLayoutNav() {
    const { showShakePopup, closeShakePopup, omikujiResult, stageIndex, registerParticleShooter } = useBle();
    const cannonRef = useRef<ConfettiCannon>(null);

    // ★ パーティクルを再生する実際の関数をContextに登録
    useEffect(() => {
        if (cannonRef.current) {
            registerParticleShooter(() => cannonRef.current?.start());
        }
    }, [registerParticleShooter]);

    const currentParticleConfig = PARTICLE_CONFIGS[stageIndex];

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} />
            <ShakeResultPopup
                visible={showShakePopup}
                onClose={closeShakePopup}
                result={omikujiResult}
            />
            {/* ★ パーティクルコンポーネントをここに移動 */}
            <View style={styles.particleContainer} pointerEvents="none">
                <ConfettiCannon
                    ref={cannonRef}
                    autoStart={false}
                    count={currentParticleConfig.count}
                    origin={currentParticleConfig.origin}
                    fallSpeed={currentParticleConfig.fallSpeed}
                    explosionSpeed={currentParticleConfig.explosionSpeed}
                    colors={currentParticleConfig.colors}
                />
            </View>
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'A_P-OTF_PuhuPicnic_Min2-H': require('@/assets/fonts/AP-PuhuPico.otf'),
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
        position: 'absolute',
        top: '50%',
        left: '50%',
    },
});