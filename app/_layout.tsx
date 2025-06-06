// app/_layout.tsx

import ShakeResultPopup from '@/components/ShakeResultPopup';
import { BleProvider, useBle } from '@/contexts/BleContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// スプラッシュスクリーンを非表示にしない
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { showShakePopup, closeShakePopup, omikujiResult } = useBle();

    return (
        <>
            <Stack screenOptions={{ headerShown: false }} />
            <ShakeResultPopup
                visible={showShakePopup}
                onClose={closeShakePopup}
                result={omikujiResult}
            />
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        // ここにアプリで使用するカスタムフォントをロードします
        'A_P-OTF_PuhuPicnic_Min2-H': require('@/assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            // フォントがロードされたらスプラッシュスクリーンを隠す
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // フォントがロードされるまで何も表示しない
    }

    return (
        <BleProvider>
            <RootLayoutNav />
        </BleProvider>
    );
}