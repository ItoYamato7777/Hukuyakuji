// components/ShakeResultPopup.tsx

import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface ShakeResultPopupProps {
    visible: boolean;
    onClose: () => void;
    result: { title: string; message: string } | null;
}

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

                    <ThemedText type="title" style={styles.title}>{result.title}</ThemedText>
                    <ThemedText style={styles.message}>{result.message}</ThemedText>
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
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
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
        fontSize: 28,
        color: '#888',
    },
    title: {
        marginBottom: 20,
        color: '#e53935', // 赤系の色
    },
    message: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
    },
});