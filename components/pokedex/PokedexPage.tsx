import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PokedexGrid } from './PokedexGrid';
import { PokedexItemDisplay, type PokedexItemData } from './PokedexItemDisplay';

export interface PokedexPageContent {
  pageId: string;
  items: PokedexItemData[];
}

// propsの型定義に、総ページ数と現在のページ番号を追加
interface PokedexPageProps {
  pageData: PokedexPageContent;
  totalPages: number;
  currentPageIndex: number;
}

const upperAreaFlex = 0.9;
const lowerAreaFlex = 1;
const PAGE_PADDING_TOP = 100;    // ページ全体の上部の隙間
const PAGE_PADDING_BOTTOM = 1; // ページ全体の下部の隙間

export function PokedexPage({ pageData, totalPages, currentPageIndex }: PokedexPageProps) {
  const [selectedItem, setSelectedItem] = useState<PokedexItemData | null>(null);

  useEffect(() => {
    if (pageData.items && pageData.items.length > 0) {
      setSelectedItem(pageData.items[0]);
    } else {
      setSelectedItem(null);
    }
  }, [pageData]);

  const handleSelectItem = (item: PokedexItemData) => {
    setSelectedItem(item);
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.displayArea}>
        <PokedexItemDisplay item={selectedItem} />
      </View>
      <View style={styles.gridArea}>
        <PokedexGrid
          items={pageData.items}
          onSelectItem={handleSelectItem}
          selectedItemId={selectedItem?.id || null}
        />
      </View>
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPageIndex === index ? styles.activeDot : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    backgroundColor: 'transparent',
    // flex: 1,
    width: Dimensions.get('window').width,
    // ↓ 新しい定数を使って上下のpaddingを設定
    paddingTop: PAGE_PADDING_TOP,
    paddingBottom: PAGE_PADDING_BOTTOM,
  },
  displayArea: {
    flex: upperAreaFlex,
    // justifyContent: 'flex-end',
    // marginBottom: gapBetweenAreas, // この行を削除
  },
  gridArea: {
    flex: lowerAreaFlex,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // paddingBottom: 10, // この行を削除 (pageContainerのpaddingBottomで管理)
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(206, 28, 28, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'rgba(96, 223, 113, 0.9)',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});