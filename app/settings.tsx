import MainLayout from '@/components/MainLayout';
import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <MainLayout>
      <View style={styles.container}>
        <ThemedText type="title">設定画面</ThemedText>
        <ThemedText style={styles.content}>
          この画面で各種設定を行います。
        </ThemedText>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    marginTop: 15,
    textAlign: 'center',
  }
});