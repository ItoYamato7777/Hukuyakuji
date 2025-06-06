# Hukuyakuji - キャラクター育成アプリケーション

このプロジェクトは、BLE（Bluetooth Low Energy）デバイスとの連携を主軸とした、React Native (Expo) 製のキャラクター育成アプリケーションです。物理的なデバイスからのイベントをトリガーに、アプリ内の世界が変化していく体験を提供します。

## ✨ 主な機能

* **BLEデバイス連携:**
    * `Hukuyakuji` という名前の特定のBLEデバイスと通信します。
    * デバイスから`"shake"`という信号を受信すると、アプリ内でイベントが発生します。

* **ダイナミックなホーム画面:**
    * BLEデバイスからの`"shake"`イベントをトリガーに、ホーム画面の背景が3段階に進化します。
    * ホーム画面に遷移するたび、キャラクターの成長段階に応じた豪華なパーティクルエフェクトが表示されます。

* **インタラクティブなポップアップ:**
    * `"shake"`イベント受信時に、結果（大吉・中吉・小吉）を知らせるポップアップがどの画面にいても表示されます。
    * ポップアップは結果に応じて色が変化するカスタムデザインです。

* **多彩なアプリケーション機能:**
    * **登録画面:** 薬の名前を入力して、新しいキャラクターを生成します。
    * **図鑑画面:** 収集したアイテムを本のようにスワイプして閲覧できます。
    * **クイズ画面:** 簡単なクイズゲームを楽しめます。

## 🚀 技術スタック

* React Native (Expo)
* TypeScript
* Expo Router (ファイルベースルーティング)
* React Native BLE PLX (Bluetooth Low Energy 通信)
* React Native Confetti Cannon (パーティクルエフェクト)


## 📁 プロジェクト構造
```bash
hukumikuji_code/
├── app/                  # 全てのスクリーン (Expo Routerが管理)
│   ├── _layout.tsx       # ルートレイアウト、グローバルなProviderを配置
│   ├── index.tsx         # ホーム画面
│   ├── pokedex.tsx       # 図鑑画面
│   ├── quiz.tsx          # クイズ画面
│   └── register.tsx      # 登録画面
│
├── assets/               # 画像やフォントなどの静的ファイル
│
├── components/           # 画面をまたいで使用される再利用可能なコンポーネント
│   ├── ble/              # BLE関連のUIコンポーネント
│   ├── pokedex/          # 図鑑機能のコンポーネント
│   ├── ui/               # 汎用的なUIコンポーネント
│   ├── BottomNavBar.tsx  # カスタムナビゲーションバー
│   ├── MainLayout.tsx    # 全画面の共通レイアウト
│   └── ShakeResultPopup.tsx # BLEイベントで表示されるポップアップ
│
└── contexts/             # グローバルな状態管理のためのReact Context
    └── BleContext.tsx    # BLE通信とキャラクターの成長段階を管理
```
