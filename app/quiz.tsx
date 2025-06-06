import CustomButton from '@/components/CustomButton';
import MainLayout from '@/components/MainLayout';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const QUIZ_DATA = {
    question: 'この薬草の主な効果は？',
    options: ['鎮痛作用', '解熱作用', '消化促進', '睡眠導入'],
    answer: '鎮痛作用',
};

export default function QuizScreen() {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleAnswerPress = (option: string) => {
        setSelectedAnswer(option);
        setIsCorrect(option === QUIZ_DATA.answer);
    };

    // テーマカラーを取得
    const feedbackColor = isCorrect === true
        ? useThemeColor({ light: 'blue', dark: 'cyan' }, 'text')
        : useThemeColor({ light: 'red', dark: 'orange' }, 'text');

    return (
        <MainLayout backgroundImageSource={require('@/assets/images/background/quiz_background.png')}>
            <View style={styles.quizContainer}>
                <ThemedText type="subtitle" style={styles.questionText}>
                    {QUIZ_DATA.question}
                </ThemedText>

                <View style={styles.optionsContainer}>
                    {QUIZ_DATA.options.map((option, index) => (
                        <CustomButton
                            key={index}
                            onPress={() => handleAnswerPress(option)}
                            text={option}
                            style={styles.optionButton}
                            textStyle={styles.optionButtonText}
                        />
                    ))}
                </View>

                {selectedAnswer && (
                    <View style={styles.feedbackContainer}>
                        <ThemedText style={[styles.feedbackText, { color: feedbackColor }]}>
                            {isCorrect ? '正解！' : '残念！'}
                        </ThemedText>
                        <ThemedText>
                            {selectedAnswer}を選択しました。
                        </ThemedText>
                    </View>
                )}
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    quizContainer: {
        backgroundColor: 'transparent', // 背景を透過させる
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    questionText: {
        textAlign: 'center',
        marginBottom: 40,
    },
    optionsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    optionButton: {
        backgroundColor: Colors.light.buttonDefault,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
        width: '80%',
        marginBottom: 15,
    },
    optionButtonText: {
        fontFamily: undefined, // デフォルトフォントに戻す
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    feedbackContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});