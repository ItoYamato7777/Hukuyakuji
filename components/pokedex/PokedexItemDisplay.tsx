import { ThemedText } from '@/components/ThemedText';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface PokedexItemData {
  id: string;
  name: string;
  largeImage: any; // require() の結果を想定
  description1: string;
  description2: string;
  description3: string;
  smallIcon: any; // require() の結果を想定
}

interface PokedexItemDisplayProps {
  item: PokedexItemData | null;
}

export function PokedexItemDisplay({ item }: PokedexItemDisplayProps) {
  if (!item) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <ThemedText>アイテムを選択してください</ThemedText>
      </View>
    );
  }

  return (
    // ThemedView から View に変更
    <View style={styles.container}>
      {/* 画像エリア */}
      <View style={styles.imageContainer}>
        <Image source={item.largeImage} style={styles.largeImage} contentFit="contain" />
      </View>
      {/* テキストエリア */}
      <View style={styles.textContainer}>
        <ThemedText type="subtitle" style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.descriptionText}>{item.description1}</ThemedText>
        <ThemedText style={styles.descriptionText}>{item.description2}</ThemedText>
        <ThemedText style={styles.descriptionText}>{item.description3}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent', // 背景を透過させる
    flexDirection: 'row',
    padding: 15,
    // 高さをFlexboxで管理するため、固定値を削除
  },
  emptyContainer: {
    height: 200, // アイテムがない時用の高さを指定
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1, // 画像コンテナが取る幅の割合
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1.2, // テキストコンテナが取る幅の割合
    justifyContent: 'center',
    paddingLeft: 10,
  },
  itemName: {
    // === 位置やデザインの調整箇所 ===
    marginBottom: 10, // 名前の下の余白
    textAlign: 'left',  // テキストの寄せ方 (left, center, right)
  },
  descriptionText: {
    // === 位置やデザインの調整箇所 ===
    fontSize: 14,      // 説明文の文字サイズ
    marginBottom: 8,   // 各行の余白
    lineHeight: 20,    // 行の高さ
  },
});