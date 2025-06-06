import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PokedexItemData } from './PokedexItemDisplay';

interface PokedexGridProps {
  items: PokedexItemData[];
  onSelectItem: (item: PokedexItemData) => void;
  selectedItemId: string | null;
}

const NUM_COLUMNS = 4;
const screenWidth = Dimensions.get('window').width;

// === 位置やデザインの調整箇所 ===
const GRID_PADDING = 10; // グリッド全体の外側の余白
const ITEM_MARGIN = 10;  // 各アイコンの周りの余白

// アイコンのサイズを画面幅と余白から計算
const itemSize = (screenWidth - (GRID_PADDING * 2) - (ITEM_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;


export function PokedexGrid({ items, onSelectItem, selectedItemId }: PokedexGridProps) {
  const renderGridItem = ({ item }: { item: PokedexItemData }) => (
    <TouchableOpacity
      style={[
        styles.gridItemContainer,
        { width: itemSize, height: itemSize, margin: ITEM_MARGIN },
        selectedItemId === item.id && styles.selectedGridItem,
      ]}
      onPress={() => onSelectItem(item)}
    >
      {/* <Image source={item.smallIcon} style={styles.smallIcon} contentFit="cover" /> */}
      <Image source={item.largeImage} style={styles.smallIcon} contentFit="cover" />
    </TouchableOpacity>
  );

  return (
    // ThemedView から View に変更
    <View style={styles.gridContainer}>
      <FlatList
        data={items}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    backgroundColor: 'transparent', // 背景を透過させる
    paddingHorizontal: GRID_PADDING,
    // paddingVertical: 0,
  },
  row: {
    justifyContent: 'center', // 行内のアイコンを中央揃えに
  },
  gridItemContainer: {
    borderRadius: itemSize / 2, // 円形にする
    overflow: 'hidden',
    borderWidth: 3, // 枠線の太さ
    borderColor: 'rgba(255, 255, 255, 0.5)', // 通常時の枠線の色と透明度
  },
  selectedGridItem: {
    borderColor: '#00BFFF', // 選択中の枠線の色 (ディープスカイブルー)
  },
  smallIcon: {
    width: '100%',
    height: '100%',
  },
});