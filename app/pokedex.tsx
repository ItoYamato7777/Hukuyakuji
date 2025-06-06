import MainLayout from '@/components/MainLayout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { PokedexPageContent } from '@/components/pokedex/PokedexPage';
import { PokedexPage } from '@/components/pokedex/PokedexPage';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

import { PAGES_DATA } from '@/components/pokedex/PokedexInfo';


export default function PokedexScreen() {
  const renderPage = ({ item }: { item: PokedexPageContent }) => (
    <PokedexPage pageData={item} />
  );

  if (!PAGES_DATA || PAGES_DATA.length === 0) {
    return (
      <MainLayout>
        <ThemedView style={styles.errorContainer}>
          <ThemedText>図鑑データを読み込めませんでした。</ThemedText>
        </ThemedView>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <FlatList
          data={PAGES_DATA}
          renderItem={renderPage}
          keyExtractor={(item) => item.pageId}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="center"
          snapToInterval={Dimensions.get('window').width}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});