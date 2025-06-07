// app/index.tsx

import MainLayout from '@/components/MainLayout';
import { useBle } from '@/contexts/BleContext';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

// 背景画像の定義のみ残す
const BACKGROUND_STAGES = [
  require('@/assets/images/background/home_background_1.png'),
  require('@/assets/images/background/home_background_2.png'),
  require('@/assets/images/background/home_background_3.png'),
];

export default function HomeScreen() {
  // ★ stageIndexとshootParticlesをContextから取得
  const { stageIndex, shootParticles } = useBle();

  const isFocused = useIsFocused();
  const isInitialMount = useRef(true);

  // 画面が表示されるたびにパーティクルを再生
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isFocused) {
      // ★ Contextの関数を呼び出してパーティクルを再生
      shootParticles();
    }
  }, [isFocused, shootParticles]);

  const currentBackground = BACKGROUND_STAGES[stageIndex];

  return (
    // ★ 外側のViewとparticleContainerスタイルは不要になったため削除
    <MainLayout
      showCharacterProfile={false}
      backgroundImageSource={currentBackground}
    >
      {/* MainLayoutの中は空 */}
    </MainLayout>
  );
}

// スタイルは現在不要なため空にする
const styles = StyleSheet.create({});