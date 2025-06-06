import MainLayout from '@/components/MainLayout';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

// ボタンの色を定義
const BUTTON_PINK = '#d33883';
const BUTTON_PINK_PRESSED = '#a31b5f';

export default function RegisterScreen() {
  const [medicationName, setMedicationName] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handlePressIn = () => {
    setIsButtonPressed(true);
  };

  const handleGeneratePress = () => {
    console.log('キャラクターを生成:', medicationName);
    // 200ミリ秒後にボタンの押下状態を解除
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 200);
  };

  return (
    <MainLayout
      backgroundImageSource={require('@/assets/images/background/register_background.png')}
    >
      <View style={styles.container}>
        <ThemedText style={styles.label}>くすりのなまえ</ThemedText>
        <TextInput
          style={[styles.input, { borderColor, color: textColor }]}
          value={medicationName}
          onChangeText={setMedicationName}
          placeholder="例：ジゴキシン"
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isButtonPressed ? BUTTON_PINK_PRESSED : BUTTON_PINK },
          ]}
          onPressIn={handlePressIn}
          onPressOut={handleGeneratePress}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.submitButtonText}>キャラクターを生成する</ThemedText>
        </TouchableOpacity>
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
    width: '100%',
  },
  label: {
    width: '80%',
    textAlign: 'left',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '80%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  submitButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});