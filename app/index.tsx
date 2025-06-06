// app/index.tsx

import MainLayout from '@/components/MainLayout';
import { useBle } from '@/contexts/BleContext';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

// 3段階の背景画像データ
const BACKGROUND_STAGES = [
  require('@/assets/images/background/home_background_1.png'),
  require('@/assets/images/background/home_background_2.png'),
  require('@/assets/images/background/home_background_3.png'),
];

// 段階ごとのパーティクルの設定
const PARTICLE_CONFIGS = [
  { count: 50, origin: { x: -10, y: 0 }, fallSpeed: 3000 }, // Stage 1
  { count: 150, origin: { x: -10, y: 0 }, fallSpeed: 3000, explosionSpeed: 400 }, // Stage 2
  { count: 250, origin: { x: -10, y: 0 }, fallSpeed: 3000, explosionSpeed: 500, colors: ["#ff0000", "#ffff00", "#0000ff"] }, // Stage 3 (豪華に)
];

export default function HomeScreen() {
  // ★ ContextからグローバルなstageIndexを取得
  const { stageIndex } = useBle();

  const cannonRef = useRef<ConfettiCannon>(null);
  const isFocused = useIsFocused();
  const isInitialMount = useRef(true);

  // 画面が表示されるたびにパーティクルを再生
  useEffect(() => {
    // 初回マウント時は再生しない
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 画面にフォーカスが当たったときに再生
    if (isFocused) {
      cannonRef.current?.start();
    }
  }, [isFocused]);

  const currentBackground = BACKGROUND_STAGES[stageIndex];
  const currentParticleConfig = PARTICLE_CONFIGS[stageIndex];

  return (
    <View style={styles.container}>
      <MainLayout
        showCharacterProfile={false}
        backgroundImageSource={currentBackground}
      >
        {/* MainLayoutの中は空 */}
      </MainLayout>

      {/* パーティクルコンポーネントを画面中央に配置 */}
      <View style={styles.particleContainer} pointerEvents="none">
        <ConfettiCannon
          ref={cannonRef}
          autoStart={false} // 自動再生はオフ
          count={currentParticleConfig.count}
          origin={currentParticleConfig.origin}
          fallSpeed={currentParticleConfig.fallSpeed}
          explosionSpeed={currentParticleConfig.explosionSpeed}
          colors={currentParticleConfig.colors}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});