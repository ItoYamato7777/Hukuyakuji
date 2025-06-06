import MainLayout from '@/components/MainLayout'; //
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

const MEDICATION_OPTIONS = [
  { id: '1', label: '花粉の薬' },
  { id: '2', label: '風邪の薬' },
  { id: '3', label: '胃腸の薬' },
];

const BUTTON_DEFAULT_LIGHT = Colors.light.buttonDefault;
const BUTTON_PRESSED_LIGHT = Colors.light.buttonPressed;
const BUTTON_DEFAULT_DARK = Colors.dark.buttonDefault;
const BUTTON_PRESSED_DARK = Colors.dark.buttonPressed;

export default function RegisterScreen() {
  const [selectedMedication, setSelectedMedication] = useState<{ id: string; label: string } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: Colors.light.icon, dark: Colors.dark.icon }, 'icon');

  const colorScheme = useThemeColor({ light: 'light', dark: 'dark' }, 'background') === Colors.dark.background ? 'dark' : 'light';
  const buttonDefaultColor = colorScheme === 'light' ? BUTTON_DEFAULT_LIGHT : BUTTON_DEFAULT_DARK;
  const buttonPressedColor = colorScheme === 'light' ? BUTTON_PRESSED_LIGHT : BUTTON_PRESSED_DARK;

  const handleSelectMedication = (medication: { id: string; label: string }) => {
    setSelectedMedication(medication);
    setIsModalVisible(false);
  };

  const handlePressIn = () => {
    setIsButtonPressed(true);
  };

  const handlePressOut = () => {
    console.log('登録:', selectedMedication?.label);
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 200);
  };

  const renderOption = ({ item }: { item: { id: string; label: string } }) => (
    <TouchableOpacity style={styles.optionItem} onPress={() => handleSelectMedication(item)}>
      <ThemedText>{item.label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <MainLayout
      backgroundImageSource={require('@/assets/images/background/register_background.png')}
      >
      <View style={styles.container}>
        <TouchableOpacity style={[styles.dropdownButton, { borderColor }]} onPress={() => setIsModalVisible(true)}>
          <ThemedText style={styles.dropdownButtonText}>
            {selectedMedication ? selectedMedication.label : '薬を選択してください'}
          </ThemedText>
          <IconSymbol name="chevron.right" size={18} color={textColor} style={styles.dropdownIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isButtonPressed ? buttonPressedColor : buttonDefaultColor },
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.submitButtonText}>決定</ThemedText>
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
            <View style={[styles.modalContent, { backgroundColor, borderColor }]}>
              <FlatList
                data={MEDICATION_OPTIONS}
                renderItem={renderOption}
                keyExtractor={(item) => item.id}
              />
            </View>
          </Pressable>
        </Modal>
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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: '80%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // 背景を少し透過させて見やすく
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  dropdownIcon: {
    transform: [{ rotate: '90deg' }],
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '50%',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});