import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
// import { TabBarIcon } from '@/components/navigation/TabBarIcon'; // アイコンコンポーネント (例)
// import { Colors } from '@/constants/Colors'; // 色設定 (例)
// import { useColorScheme } from '@/hooks/useColorScheme'; // 色設定用フック (例)

// アイコンのプレースホルダー (実際のアイコンライブラリやカスタムコンポーネントに置き換えてください)
// 例: import { Ionicons } from '@expo/vector-icons';
// const TabBarIcon = ({ name, color, size }: { name: any; color: string; size: number }) => (
//   <Ionicons name={name} size={size} color={color} style={{ marginBottom: -3 }} />
// );

// UIに凝るというご要望に合わせて、カスタムアイコンコンポーネントの利用を推奨します。
// 既存の HapticTab や TabBarBackground も流用または参考にできます。
import { HapticTab } from '@/components/HapticTab'; // 既存のコンポーネント
import { IconSymbol } from '@/components/ui/IconSymbol'; // 既存のアイコンコンポーネント
import TabBarBackground from '@/components/ui/TabBarBackground'; // 既存の背景
import { Colors } from '@/constants/Colors'; // 既存の色定義
import { useColorScheme } from '@/hooks/useColorScheme'; // 既存のフック


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeTintColor = Colors[colorScheme ?? 'light'].tint; //
  const inactiveTintColor = Colors[colorScheme ?? 'light'].tabIconDefault; // 未選択時の色

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        headerShown: false, // 各タブスクリーンのヘッダーは非表示 (ルートで制御)
        tabBarButton: HapticTab, // 既存のHapticTabを使用
        tabBarBackground: TabBarBackground, // 既存のTabBarBackgroundを使用
        tabBarStyle: Platform.select({ // 既存のスタイル設定
          ios: {
            position: 'absolute', // iOSでのブラー効果のため
          },
          android: {
            // Android固有のスタイルがあれば追加
            // backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 0,
            elevation: 0, // 影を消す場合
          },
          default: {},
        }),
        // tabBarShowLabel: false, // ラベルを非表示にする場合
        // tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold'}, // ラベルスタイル
        // tabStyle: { paddingBottom: 5, paddingTop: 5}, // タブ全体のスタイル
      }}>
      <Tabs.Screen
        name="home" // `app/(tabs)/home.tsx` に対応
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 30 : 28} name={focused ? "house.fill" : "house"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record" // `app/(tabs)/record.tsx` に対応
        options={{
          title: 'きろく',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 30 : 28} name={focused ? "pencil.and.list.clipboard.fill" : "pencil.and.list.clipboard"} color={color} />
            // 例: <TabBarIcon name={focused ? "document-text" : "document-text-outline"} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection" // `app/(tabs)/collection.tsx` に対応
        options={{
          title: 'ずかん',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 30 : 28} name={focused ? "book.fill" : "book"} color={color} />
            // 例: <TabBarIcon name={focused ? "albums" : "albums-outline"} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz" // `app/(tabs)/quiz.tsx` に対応
        options={{
          title: 'クイズ',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 30 : 28} name={focused ? "questionmark.diamond.fill" : "questionmark.diamond"} color={color} />
            // 例: <TabBarIcon name={focused ? "help-circle" : "help-circle-outline"} color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // `app/(tabs)/settings.tsx` に対応
        options={{
          title: 'せってい',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={focused ? 30 : 28} name={focused ? "gearshape.fill" : "gearshape"} color={color} />
            // 例: <TabBarIcon name={focused ? "settings" : "settings-outline"} color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}