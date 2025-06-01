import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
// import { useRouter } from 'expo-router'; // 他のタブへの遷移はTabNavigatorが担うので基本不要

// 仮のキャラクターデータ型
interface Character {
    id: string;
    name: string;
    level: number;
    experience: number;
    maxExperience: number;
    imageUri: any; // require('@/assets/images/character.png') のような形式
    status: 'idle' | 'hungry' | 'waiting_med' | 'happy';
    greeting: string;
    // 将来的にはもっと多くのプロパティ（属性、進化段階など）
}

// 仮のキャラクターデータ (実際には状態管理システムやAPIから取得)
const initialCharacterData: Character = {
    id: 'kamisama_001',
    name: 'おくすり神',
    level: 1,
    experience: 30,
    maxExperience: 100,
    imageUri: require('@/assets/images/default_character.png'), // デフォルトのキャラクター画像パスを指定してください
    status: 'idle',
    greeting: 'こんにちは！お薬、ちゃんと飲んでるかな？',
};

// 仮のステータスアイコン (実際には画像ファイルを用意)
const statusIcons = {
    idle: '☀️', // 例: 太陽アイコン
    hungry: '🍲', // 例: 食べ物アイコン
    waiting_med: '💊', // 例: 薬アイコン
    happy: '😊',  // 例: 笑顔アイコン
};

export default function HomeScreen() {
    const [character, setCharacter] = useState<Character>(initialCharacterData);
    const [showGreeting, setShowGreeting] = useState(false);

    // キャラクターアニメーション用 (例: 左右に揺れる)
    const揺れアニメーション = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 揺れるアニメーションを開始
        Animated.loop(
            Animated.sequence([
                Animated.timing(揺れアニメーション, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(揺れアニメーション, {
                    toValue: -1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(揺れアニメーション, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [揺れアニメーション]);

    const handleCharacterPress = () => {
        setShowGreeting(true);
        // 2秒後に吹き出しを消す
        setTimeout(() => {
            setShowGreeting(false);
        }, 2000);

        // TODO: 将来的には状態に応じて異なるセリフやアクション
        // 例: if (character.status === 'hungry') { setCharacter(prev => ({...prev, greeting: "お腹すいたなぁ..."}))}
    };

    const getExperiencePercentage = () => {
        return (character.experience / character.maxExperience) * 100;
    };

    // 背景を時間帯によって変更する例 (簡易版)
    const getBackgroundColor = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return styles.backgroundMorning; // 朝
        if (hour >= 12 && hour < 18) return styles.backgroundDay;   // 昼
        if (hour >= 18 && hour < 22) return styles.backgroundEvening; // 夕方
        return styles.backgroundNight; // 夜
    };

    return (
        <SafeAreaView style={[styles.safeArea, getBackgroundColor()]}>
            <View style={styles.container}>
                {/* キャラクター情報エリア */}
                <View style={styles.characterInfoContainer}>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <View style={styles.levelContainer}>
                        <Text style={styles.levelText}>Lv. {character.level}</Text>
                        <View style={styles.experienceBarBackground}>
                            <View style={[styles.experienceBarFill, { width: `${getExperiencePercentage()}%` }]} />
                        </View>
                        <Text style={styles.experienceText}>{character.experience} / {character.maxExperience}</Text>
                    </View>
                    <Text style={styles.statusIcon}>{statusIcons[character.status]}</Text>
                </View>

                {/* キャラクター表示エリア */}
                <Pressable onPress={handleCharacterPress} style={styles.characterPressable}>
                    <Animated.View style={{
                        transform: [{
                            translateX: 揺れアニメーション.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [-10, 10] // 揺れの幅
                            })
                        }]
                    }}>
                        <Image source={character.imageUri} style={styles.characterImage} />
                    </Animated.View>
                    {showGreeting && (
                        <View style={styles.greetingBubble}>
                            <Text style={styles.greetingText}>{character.greeting}</Text>
                        </View>
                    )}
                </Pressable>

                {/* TODO: 将来的にはここにキャラクターの状態に応じたインタラクション要素やミニゲームの導線など */}
                {/* <View style={styles.interactionArea}>
          <Button title="ごはんをあげる" onPress={() => console.log("ごはんをあげる")} />
        </View> */}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    backgroundMorning: { backgroundColor: '#87CEEB' }, // 明るい水色
    backgroundDay: { backgroundColor: '#ADD8E6' },    // 水色
    backgroundEvening: { backgroundColor: '#4682B4' }, // スチールブルー
    backgroundNight: { backgroundColor: '#000080' },  // ネイビー
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around', // 要素を均等に配置
        padding: 20,
    },
    characterInfoContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 15,
        width: '90%',
        maxWidth: 350,
    },
    characterName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    levelText: {
        fontSize: 16,
        color: '#555',
        marginRight: 10,
    },
    experienceBarBackground: {
        height: 10,
        width: 100, // または '60%' など
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden', // fillがはみ出ないように
        marginRight: 5,
    },
    experienceBarFill: {
        height: '100%',
        backgroundColor: '#4CAF50', // 緑色
        borderRadius: 5,
    },
    experienceText: {
        fontSize: 12,
        color: '#777',
    },
    statusIcon: {
        fontSize: 24, // アイコンのサイズに合わせて調整
        marginTop: 5,
    },
    characterPressable: {
        alignItems: 'center',
        position: 'relative', // 吹き出しの位置調整のため
    },
    characterImage: {
        width: 200, // キャラクター画像のサイズに合わせて調整
        height: 200,
        resizeMode: 'contain',
    },
    greetingBubble: {
        position: 'absolute',
        bottom: -40, // キャラクター画像の下に表示
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        // iOS Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Android Shadow
        elevation: 5,
    },
    greetingText: {
        fontSize: 14,
        color: '#333',
    },
    // interactionArea: {
    //   marginTop: 20,
    //   width: '80%',
    //   alignItems: 'center',
    // },
});