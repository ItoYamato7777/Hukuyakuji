// app/index.tsx

import MainLayout from '@/components/MainLayout';
import { useBle } from '@/contexts/BleContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

// 3段階の背景画像データ
const BACKGROUND_STAGES = [
  // 第1段階の背景画像
  require('@/assets/images/background/home_background_1.png'),
  // 第2段階の背景画像
  // 仮の画像を指定しています。用意された画像パスに差し替えてください。
  require('@/assets/images/background/home_background_2.png'),
  // 第3段階の背景画像
  // 仮の画像を指定しています。用意された画像パスに差し替えてください。
  require('@/assets/images/background/home_background_3.png'),
];

export default function HomeScreen() {
  const { setOmikujiTrigger } = useBle();
  const [stageIndex, setStageIndex] = useState(0);

  // BLEコンテキストに、shakeイベントで実行する処理を登録
  useEffect(() => {
    const triggerGrowth = () => {
      setStageIndex(currentStage => {
        // 最後のステージより先には進まない
        return Math.min(currentStage + 1, BACKGROUND_STAGES.length - 1);
      });
    };
    setOmikujiTrigger(triggerGrowth);

    // コンポーネントのアンマウント時に登録解除
    return () => {
      setOmikujiTrigger(null);
    };
  }, [setOmikujiTrigger]);

  const currentBackground = BACKGROUND_STAGES[stageIndex];

  return (
    <MainLayout
      // プロファイル表示をオフにする
      showCharacterProfile={false}
      // 現在のステージの背景画像を渡す
      backgroundImageSource={currentBackground}
    >
      {/* 中央のImageコンポーネントはなし */}
    </MainLayout>
  );
}

// スタイルは現在使用していないため、削除または空にしても問題ありません。
const styles = StyleSheet.create({

});