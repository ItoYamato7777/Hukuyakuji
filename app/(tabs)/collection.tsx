import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
// import { useCharacterContext } from '@/context/CharacterContext'; // キャラクターリストをContextから取得 (仮)

// 仮のキャラクターデータ型 (ホーム画面のものを拡張)
interface CollectionCharacter {
  id: string;
  name: string;
  level: number;
  // experience: number; // 詳細表示用
  // maxExperience: number; // 詳細表示用
  imageUri: any; // require('@/assets/images/character_xxx.png')
  thumbnailUri?: any; // 一覧表示用の小さな画像 (imageUriと同じでも可)
  isUnlocked: boolean; // 獲得済みかどうか
  description: string; // 薬の効果やキャラクターの説明
  sourceMedication?: string; // 元になった薬の名前
  // evolutionStages?: { level: number, imageUri: any }[]; // 成長段階
  // attributes?: string[]; // 属性（例：胃、頭痛など）
}

// 仮の図鑑データ (実際には状態管理システムやAPIから取得)
const initialCollectionData: CollectionCharacter[] = [
  {
    id: 'kamisama_001',
    name: 'おくすり神・初',
    level: 5,
    imageUri: require('@/assets/images/character_001_full.png'), // 詳細表示用画像
    thumbnailUri: require('@/assets/images/character_001_thumb.png'), // 一覧用サムネイル
    isUnlocked: true,
    description: '全ての薬の始まりを司る穏やかな神様。優しく健康を見守る。',
    sourceMedication: '初期設定',
  },
  {
    id: 'kamisama_002',
    name: 'カゼナオールA',
    level: 1,
    imageUri: require('@/assets/images/character_002_full.png'),
    thumbnailUri: require('@/assets/images/character_002_thumb.png'),
    isUnlocked: true,
    description: '風邪の諸症状を和らげる、頼れる風邪薬の神様。素早い治癒が得意。',
    sourceMedication: '総合風邪薬カゼナオール',
  },
  {
    id: 'kamisama_003',
    name: '？？？',
    level: 0,
    imageUri: require('@/assets/images/character_unknown_full.png'), // 未開放時の詳細画像 (シルエットなど)
    thumbnailUri: require('@/assets/images/character_unknown_thumb.png'), // 未開放時のサムネイル (シルエットなど)
    isUnlocked: false,
    description: 'まだ出会っていない謎の神様。どんな力を持っているのだろうか…？',
  },
  // ... 他のキャラクターデータを追加
];

const NUM_COLUMNS = 3; // グリッド表示の列数
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CollectionScreen() {
  // const { characters } = useCharacterContext(); // Contextからキャラクターリストを取得 (仮)
  const [characters, setCharacters] = useState<CollectionCharacter[]>(initialCollectionData); // 仮データを使用
  const [selectedCharacter, setSelectedCharacter] = useState<CollectionCharacter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // TODO: ソート機能、フィルター機能の実装
  // const [sortOrder, setSortOrder] = useState<'id' | 'level' | 'name'>('id');
  // const [filterUnlocked, setFilterUnlocked] = useState<boolean | null>(null);

  const handleSelectCharacter = (character: CollectionCharacter) => {
    if (character.isUnlocked) {
      setSelectedCharacter(character);
      setModalVisible(true);
    } else {
      // 未開放キャラクターをタップした場合の処理（例：ヒントを表示など）
      Alert.alert("未開放", "この神様とはまだ出会っていません。");
    }
  };

  const renderCharacterItem = ({ item }: { item: CollectionCharacter }) => {
    const itemSize = (SCREEN_WIDTH - (styles.listContainer.paddingHorizontal || 0) * 2 - (NUM_COLUMNS -1) * 10) / NUM_COLUMNS; // 10はitem間のマージン仮定

    return (
      <Pressable
        style={[styles.itemContainer, { width: itemSize, height: itemSize }]}
        onPress={() => handleSelectCharacter(item)}>
        <Image
          source={item.isUnlocked ? item.thumbnailUri : require('@/assets/images/character_silhouette_thumb.png')} // 未開放時はシルエット
          style={styles.itemImage}
        />
        {item.isUnlocked && (
          <View style={styles.itemNameContainer}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
        )}
        {!item.isUnlocked && (
           <View style={styles.itemLockIconContainer}>
            <Text style={styles.itemLockIcon}>🔒</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TODO: ソート・フィルター用のUIをここに追加 */}
      {/* <View style={styles.filterBar}>
        <Button title="ID順" onPress={() => {}} />
        <Button title="レベル順" onPress={() => {}} />
      </View> */}

      <FlatList
        data={characters}
        renderItem={renderCharacterItem}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
      />

      {selectedCharacter && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setSelectedCharacter(null);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={selectedCharacter.imageUri} style={styles.modalImage} />
              <Text style={styles.modalCharacterName}>{selectedCharacter.name}</Text>
              <Text style={styles.modalLabel}>レベル:</Text>
              <Text style={styles.modalText}>{selectedCharacter.level}</Text>
              <Text style={styles.modalLabel}>元になった薬:</Text>
              <Text style={styles.modalText}>{selectedCharacter.sourceMedication || 'N/A'}</Text>
              <Text style={styles.modalLabel}>説明:</Text>
              <ScrollView style={styles.modalDescriptionScroll}>
                <Text style={styles.modalText}>{selectedCharacter.description}</Text>
              </ScrollView>
              <Pressable
                style={[styles.buttonBase, styles.closeButton]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setSelectedCharacter(null);
                }}>
                <Text style={styles.buttonText}>閉じる</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between', // 各行のアイテムを均等に配置
    marginBottom: 10, // 行間のマージン
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // 画像と名前を中央に
    padding: 5, // 内側のパディングを少し減らす
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    // Android Shadow
    elevation: 2,
    position: 'relative', // ロックアイコン用
  },
  itemImage: {
    width: '80%', // 親コンテナに対しての割合
    height: '70%', // 親コンテナに対しての割合
    resizeMode: 'contain',
    marginBottom: 5,
  },
  itemNameContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  itemLockIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 3,
  },
  itemLockIcon: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 半透明の背景
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Android Shadow
    elevation: 5,
  },
  modalImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalCharacterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  modalDescriptionScroll: {
    maxHeight: 100, // 説明文が長すぎる場合にスクロール可能に
    width: '100%',
    marginBottom: 15,
  },
  buttonBase: { // 記録画面のスタイルを流用・調整
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: { // 記録画面のスタイルを流用
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});