import AsyncStorage from '@react-native-async-storage/async-storage'; // 永続化のために追加
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';

// キャラクターデータの型定義 (home.tsxから流用・拡張)
export interface Character {
    id: string;
    name: string;
    level: number;
    experience: number;
    maxExperience: number; // 次のレベルに必要な経験値
    imageUri: any; // require()で読み込むパス
    status: 'idle' | 'hungry' | 'waiting_med' | 'happy'; // キャラクターの状態
    // 必要に応じて他のプロパティ（進化段階、アンロック状況など）も追加
}

interface CharacterContextState {
    character: Character | null; // 初期状態はnullまたはデフォルトキャラ
    addExperience: (points: number) => void;
    // 必要に応じて他の関数（例: setCharacterStatus, evolveCharacterなど）も追加
    isLoading: boolean; // データロード中フラグ
}

const CharacterContext = createContext<CharacterContextState | undefined>(undefined);

export const useCharacter = (): CharacterContextState => {
    const context = useContext(CharacterContext);
    if (!context) {
        throw new Error('useCharacter must be used within a CharacterProvider');
    }
    return context;
};

// 初期キャラクターデータ
const initialCharacterData: Character = {
    id: 'kamisama_001',
    name: 'おくすり神',
    level: 1,
    experience: 0,
    maxExperience: 100, // レベル1→2に100ポイント必要
    imageUri: require('@/assets/images/default_character.png'), // デフォルト画像パス
    status: 'idle',
};

const CHARACTER_STORAGE_KEY = '@MyMedicationApp:CharacterData';

export const CharacterProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- データロード処理 ---
    useEffect(() => {
        const loadCharacterData = async () => {
            try {
                const storedCharacter = await AsyncStorage.getItem(CHARACTER_STORAGE_KEY);
                if (storedCharacter) {
                    const parsedCharacter = JSON.parse(storedCharacter) as Character;
                    // 画像URIはrequireの解決が必要なため、保存された文字列パスから再度requireする処理はここでは困難。
                    // 簡単のため、画像URIは固定とするか、または画像IDのようなものを保存して動的に解決する。
                    // 今回は、保存されたデータがあってもimageUriはinitialCharacterDataのものを使う簡易実装。
                    setCharacter({ ...parsedCharacter, imageUri: initialCharacterData.imageUri });
                } else {
                    setCharacter(initialCharacterData); // 初回起動時は初期データ
                }
            } catch (e) {
                console.error("Failed to load character data.", e);
                setCharacter(initialCharacterData); // エラー時も初期データ
            } finally {
                setIsLoading(false);
            }
        };
        loadCharacterData();
    }, []);

    // --- データセーブ処理 ---
    useEffect(() => {
        const saveCharacterData = async () => {
            if (character && !isLoading) { // isLoadingがfalseになってから保存開始
                try {
                    // imageUriはrequire()の結果であり、直接JSONシリアライズできない可能性があるため除外するか、
                    // 文字列パスとして保存するなどの工夫が必要。今回は簡易的に除外。
                    const { imageUri, ...characterToSave } = character;
                    await AsyncStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characterToSave));
                } catch (e) {
                    console.error("Failed to save character data.", e);
                }
            }
        };
        saveCharacterData();
    }, [character, isLoading]);


    // --- 経験値加算とレベルアップ処理 ---
    const addExperience = useCallback((points: number) => {
        if (!character) return;

        let newExperience = character.experience + points;
        let newLevel = character.level;
        let newMaxExperience = character.maxExperience;
        let newStatus = character.status;

        // レベルアップ判定
        while (newExperience >= newMaxExperience) {
            newLevel++;
            newExperience -= newMaxExperience;
            // 次のレベルアップに必要な経験値を設定（例: 1.5倍にするなど、ゲームバランスに応じて調整）
            newMaxExperience = Math.floor(newMaxExperience * 1.5);
            newStatus = 'happy'; // レベルアップ時はハッピーに
            console.log(`レベルアップ！ Lv.${newLevel} になりました！`);
            // TODO: レベルアップ時の特別なエフェクトや通知をトリガーすることも可能
        }

        setCharacter(prevCharacter => ({
            ...(prevCharacter as Character), // prevCharacterがnullでないことを保証
            level: newLevel,
            experience: newExperience,
            maxExperience: newMaxExperience,
            status: newStatus, // とりあえず獲得時はhappyにするなど調整可能
        }));

        console.log(`${points}ポイント獲得。現在の経験値: ${newExperience}/${newMaxExperience}`);

    }, [character]);


    const contextValue: CharacterContextState = {
        character,
        addExperience,
        isLoading,
    };

    return (
        <CharacterContext.Provider value={contextValue}>
            {children}
        </CharacterContext.Provider>
    );
};