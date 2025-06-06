import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// 共通のフォントスタイルをオブジェクトとして定義
const puhuFontStyle = {
    fontFamily: 'A_P-OTF_PuhuPicnic_Min2-H',
    color: '#7b99cc',
};

// キャラクターのデータをpropsで受け取る
const CharacterProfile = ({ status, name, nameSuffix, level, nextExp }) => {
    return (
        <View style={styles.profileSection}>
            <Text style={styles.characterStatus}>{status}</Text>
            <View style={styles.nameContainer}>
                <Text style={styles.characterName}>{name}</Text>
                <Text style={styles.characterNameSuffix}>{nameSuffix}</Text>
            </View>
            <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Lv.{level}</Text>
            </View>
            <View style={styles.expContainer}>
                <Text style={styles.expLabel}>つぎ</Text>
                <Text style={styles.expText}>次のLvまであと {nextExp}pt</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    profileSection: {
        alignItems: 'flex-start', // 左寄せに
        padding: 20,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end', // ベースラインを揃える
        marginBottom: 10,
    },
    characterStatus: {
        fontSize: 12,
        letterSpacing: -1.8,
        ...puhuFontStyle,
    },
    characterName: {
        fontSize: 24,
        letterSpacing: -3.6,
        ...puhuFontStyle,
    },
    characterNameSuffix: {
        fontSize: 10,
        letterSpacing: -1.5,
        marginLeft: 5, // 名前との間隔
        ...puhuFontStyle,
    },
    levelContainer: {
        marginBottom: 5,
    },
    levelText: {
        fontSize: 16,
        ...puhuFontStyle,
    },
    expContainer: {
        // position: 'absolute' を削除
    },
    expLabel: {
        fontSize: 8,
        letterSpacing: -1.2,
        ...puhuFontStyle,
    },
    expText: {
        fontSize: 12,
        letterSpacing: -1.8,
        ...puhuFontStyle,
    },
});

export default CharacterProfile;