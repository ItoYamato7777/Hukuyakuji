// components/ShakeResultPopup.tsx

import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface ShakeResultPopupProps {
    visible: boolean;
    onClose: () => void;
    result: { title: string; message: string } | null;
}

// 結果に応じて文字色を返すヘルパー関数
const getTitleColor = (title: string): string => {
    switch (title) {
        case '大吉':
            return '#e53935'; // 赤
        case '中吉':
            return '#fdd835'; // 黄色
        case '小吉':
            return '#43a047'; // 緑
        default:
            return '#000000'; // デフォルトは黒
    }
};

export default function ShakeResultPopup({ visible, onClose, result }: ShakeResultPopupProps) {
    if (!result) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>

                    <ThemedText style={[styles.title, { color: getTitleColor(result.title) }]}>
                        {result.title}
                    </ThemedText>
                    <ThemedText style={styles.message}>
                        {result.message}
                    </ThemedText>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    popupContainer: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#e0f7fa', // 薄い水色
        borderRadius: 15,
        padding: 25,
        paddingTop: 40, // タイトルと閉じるボタンのスペースを確保
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 15,
    },
    closeButtonText: {
        fontSize: 32,
        color: '#00838f', // 濃い水色
        fontWeight: 'bold',
    },
    title: {
        fontSize: 40, // 少し大きくして見栄えを調整
        fontWeight: 'bold',
        marginBottom: 20,
        // 色はコンポーネント内で動的に設定
    },
    message: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        color: '#ffffff', // 白色
        // 読みやすさのため、わずかに影を追加
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});