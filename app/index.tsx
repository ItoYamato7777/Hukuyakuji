// app/index.tsx

import MainLayout from '@/components/MainLayout';
import { useBle } from '@/contexts/BleContext';
import React, { useEffect, useState } from 'react';

// 3段階のキャラクターデータ（背景画像とプロファイル）
const CHARACTER_STAGES = [
  {
    // 第1段階の背景画像
    background: require('@/assets/images/background/home_background_1.png'),
    profile: {
      status: 'うまれたて',
      name: 'ジゴキシン 神',
      nameSuffix: 'がみ',
      level: 3,
      nextExp: 50,
    }
  },
  {
    // 第2段階の背景画像
    // 仮の画像を指定しています。用意された画像パスに差し替えてください。
    background: require('@/assets/images/background/home_background_2.png'),
    profile: {
      status: 'すこし育った',
      name: 'ジゴキシン 神',
      nameSuffix: 'がみ',
      level: 5,
      nextExp: 100,
    }
  },
  {
    // 第3段階の背景画像
    // 仮の画像を指定しています。用意された画像パスに差し替えてください。
    background: require('@/assets/images/background/home_background_3.png'),
    profile: {
      status: '最終形態',
      name: 'ジゴキシン EX',
      nameSuffix: 'いーえっくす',
      level: 10,
      nextExp: 999,
    }
  }
];

export default function HomeScreen() {
  const { setOmikujiTrigger } = useBle();
  const [stageIndex, setStageIndex] = useState(0);

  // BLEコンテキストに、shakeイベントで実行する処理を登録
  useEffect(() => {
    const triggerGrowth = () => {
      setStageIndex(currentStage => {
        // 最後のステージより先には進まない
        return Math.min(currentStage + 1, CHARACTER_STAGES.length - 1);
      });
    };
    setOmikujiTrigger(triggerGrowth);

    // コンポーネントのアンマウント時に登録解除
    return () => {
      setOmikujiTrigger(null);
    };
  }, [setOmikujiTrigger]);

  const currentStage = CHARACTER_STAGES[stageIndex];

  return (
    <MainLayout
      showCharacterProfile={true}
      characterData={currentStage.profile} // 現在のステージのプロファイルを渡す
      backgroundImageSource={currentStage.background} // 現在のステージの背景画像を渡す
    >
      {/* 中央のImageコンポーネントは削除しました */}
    </MainLayout>
  );
}