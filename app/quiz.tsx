import CustomButton from '@/components/CustomButton';
import MainLayout from '@/components/MainLayout';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// ご提示の情報から作成したクイズバンク
const QUIZ_BANK = [
    {
        question: '「フロセミド」の主な効果はどれ？',
        options: ['体の余分な水を出す', '心臓の力を強くする', '血管をやわらかくする', '心臓のリズムを整える'],
        answer: '体の余分な水を出す',
    },
    {
        question: '飲むと咳が出ることがある、と注意喚起されている薬はどれ？',
        options: ['カルベジロール', 'エナラプリル', 'ジゴキシン', 'フロセミド'],
        answer: 'エナラプリル',
    },
    {
        question: '「ジゴキシン」を飲むときに特に注意が必要なことは？',
        options: ['血中濃度の管理', 'トイレの回数が増える', '急にやめるのは危険', '定期的な肺の検査'],
        answer: '血中濃度の管理',
    },
    {
        question: '急にやめると危険なため、自己判断で中断してはいけない薬はどれ？',
        options: ['アミオダロン', 'カルベジロール', 'エナラプリル', 'ジゴキシン'],
        answer: 'カルベジロール',
    },
    {
        question: '「アミオダロン」を飲む際に、特に機能を見守る必要がある臓器は？',
        options: ['腎臓と肝臓', '肺と肝臓', '心臓と肺', '胃と腸'],
        answer: '肺と肝臓',
    }
];

// クイズの型定義
interface Quiz {
    question: string;
    options: string[];
    answer: string;
}

export default function QuizScreen() {
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // 画面が表示されるたびに新しいクイズをランダムで設定
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * QUIZ_BANK.length);
        setCurrentQuiz(QUIZ_BANK[randomIndex]);
        // 回答状態をリセット
        setSelectedAnswer(null);
        setIsCorrect(null);
    }, []);

    const handleAnswerPress = (option: string) => {
        // 一度回答したら変更できないようにする
        if (selectedAnswer) return;

        setSelectedAnswer(option);
        setIsCorrect(option === currentQuiz?.answer);
    };

    const feedbackColor = isCorrect === true
        ? useThemeColor({ light: 'blue', dark: 'cyan' }, 'text')
        : useThemeColor({ light: 'red', dark: 'orange' }, 'text');

    // クイズが読み込まれるまでのローディング表示
    if (!currentQuiz) {
        return (
            <MainLayout>
                <ActivityIndicator size="large" />
            </MainLayout>
        );
    }

    return (
        <MainLayout backgroundImageSource={require('@/assets/images/background/quiz_background.png')}>
            <View style={styles.quizContainer}>
                <ThemedText type="subtitle" style={styles.questionText}>
                    {currentQuiz.question}
                </ThemedText>

                <View style={styles.optionsContainer}>
                    {currentQuiz.options.map((option, index) => (
                        <CustomButton
                            key={index}
                            onPress={() => handleAnswerPress(option)}
                            text={option}
                            style={[
                                styles.optionButton,
                                // 回答後にスタイルを変更
                                selectedAnswer && {
                                    backgroundColor: option === currentQuiz.answer
                                        ? Colors.light.tint // 正解の選択肢
                                        : option === selectedAnswer
                                            ? Colors.light.error // 間違った自分の選択
                                            : Colors.light.buttonDefault, // その他
                                    opacity: selectedAnswer && option !== currentQuiz.answer ? 0.5 : 1
                                }
                            ]}
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
                            正解は「{currentQuiz.answer}」です。
                        </ThemedText>
                    </View>
                )}
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    quizContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        width: '100%',
    },
    questionText: {
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 10,
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
        width: '85%',
        marginBottom: 15,
    },
    optionButtonText: {
        fontFamily: undefined,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    feedbackContainer: {
        marginTop: 30,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});