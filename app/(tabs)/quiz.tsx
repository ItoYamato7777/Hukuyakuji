import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Alert } from 'react-native';
// import { useCharacterContext } from '@/context/CharacterContext'; // ポイント付与などで連携 (仮)

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  category?: string; // 例: '風邪薬', '生活習慣病'など
}

// 仮のクイズデータ (実際には外部ファイルやDBから取得)
const initialQuizData: QuizQuestion[] = [
  {
    id: 'q1',
    questionText: '風邪をひいたとき、最初にとるべき行動として最も適切なものはどれ？',
    options: [
      { id: 'q1_opt1', text: 'すぐに解熱剤を飲む' },
      { id: 'q1_opt2', text: '栄養ドリンクを大量に飲む' },
      { id: 'q1_opt3', text: '暖かくして安静にする' },
      { id: 'q1_opt4', text: '熱いお風呂に入る' },
    ],
    correctOptionId: 'q1_opt3',
    explanation: '風邪の初期には、まず体を休めることが重要です。解熱剤は症状を一時的に抑えますが、根本的な治療ではありません。',
    category: '風邪の対処法',
  },
  {
    id: 'q2',
    questionText: '食後に飲む薬が多い理由として、適切でないものはどれ？',
    options: [
      { id: 'q2_opt1', text: '胃への負担を軽減するため' },
      { id: 'q2_opt2', text: '薬の吸収を良くするため' },
      { id: 'q2_opt3', text: '飲み忘れを防ぐため' },
      { id: 'q2_opt4', text: '薬の効果を最大限に高めるため' },
    ],
    correctOptionId: 'q2_opt4', // 薬の効果を最大限に高める、は一概には言えないため
    explanation: '食後に飲む薬は、胃腸への刺激を和らげたり、食事と一緒に吸収されることで効果が安定するものが多いためです。飲み忘れ防止の目的もあります。',
    category: '薬の飲み方',
  },
  // ... 他のクイズデータを追加
];

export default function QuizScreen() {
  // const { addQuizPoints } = useCharacterContext(); // クイズポイントをキャラクターに加算 (仮)
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuizData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // 新しいクイズを開始する処理（またはカテゴリ選択後など）
  const startNewQuiz = useCallback(() => {
    // 実際にはここでカテゴリに応じた問題を取得したり、ランダムにシャッフルしたりする
    // const shuffledQuestions = [...initialQuizData].sort(() => Math.random() - 0.5);
    // setQuestions(shuffledQuestions.slice(0, 5)); // 例: 5問に限定
    setQuestions(initialQuizData); // 今回は全問出す
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setShowExplanation(false);
    setQuizFinished(false);
  }, []);

  useEffect(() => {
    startNewQuiz(); // 画面表示時に新しいクイズを開始
  }, [startNewQuiz]);

  const handleOptionPress = (optionId: string) => {
    if (isAnswered) return; // 回答済みなら何もしない

    setSelectedOptionId(optionId);
    setIsAnswered(true);
    setShowExplanation(true);

    if (optionId === currentQuestion.correctOptionId) {
      setScore(prevScore => prevScore + 1);
      // 正解時のエフェクトやメッセージ
    } else {
      // 不正解時のエフェクトやメッセージ
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // 全問終了
      setQuizFinished(true);
      // addQuizPoints(score); // キャラクターにポイントを加算 (仮)
      Alert.alert("クイズ終了！", `あなたのスコアは ${score} / ${questions.length} です。`);
    }
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>クイズを準備中です...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizFinished) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.finishedTitle}>クイズお疲れ様でした！</Text>
          <Text style={styles.scoreText}>最終スコア: {score} / {questions.length}</Text>
          {/* <Text>獲得ポイント: {score * 10}pt</Text> */}
          <Pressable style={[styles.buttonBase, styles.actionButton]} onPress={startNewQuiz}>
            <Text style={styles.buttonText}>もう一度挑戦する</Text>
          </Pressable>
          {/* <Pressable style={[styles.buttonBase, styles.secondaryButton]} onPress={() => router.back()}>
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>ホームに戻る</Text>
          </Pressable> */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.quizHeader}>
          <Text style={styles.questionCounter}>
            問題 {currentQuestionIndex + 1} / {questions.length}
          </Text>
          {currentQuestion.category && <Text style={styles.categoryText}>{currentQuestion.category}</Text>}
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map(option => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === currentQuestion.correctOptionId;
            let optionStyle = [styles.optionButton];
            let textStyle = [styles.optionText];

            if (isAnswered) {
              if (isCorrect) {
                optionStyle.push(styles.correctOption);
                textStyle.push(styles.correctOptionText);
              } else if (isSelected && !isCorrect) {
                optionStyle.push(styles.incorrectOption);
                textStyle.push(styles.incorrectOptionText);
              } else {
                optionStyle.push(styles.disabledOption); // 未選択の不正解選択肢など
              }
            }

            return (
              <Pressable
                key={option.id}
                style={optionStyle}
                onPress={() => handleOptionPress(option.id)}
                disabled={isAnswered}>
                <Text style={textStyle}>{option.text}</Text>
              </Pressable>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanationContainer}>
            <Text style={styles.explanationTitle}>
              {selectedOptionId === currentQuestion.correctOptionId ? "正解！" : "残念！"}
            </Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </View>
        )}

        {isAnswered && (
          <Pressable style={[styles.buttonBase, styles.actionButton, styles.nextButton]} onPress={handleNextQuestion}>
            <Text style={styles.buttonText}>
              {currentQuestionIndex < questions.length - 1 ? "次の問題へ" : "結果を見る"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8F0FE', // 明るい青系の背景
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: { // quizFinished時のスタイル
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
  quizHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  questionCounter: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
    overflow: 'hidden', // borderRadiusを適用するため for Android
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android Shadow
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26, // 行間を調整
    color: '#333333',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25, // 角を丸く
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#B0C4DE', // やや薄い青系のボーダー
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Android Shadow
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#D4EDDA', // 薄い緑
    borderColor: '#C3E6CB',
  },
  correctOptionText: {
    color: '#155724', // 濃い緑
    fontWeight: 'bold',
  },
  incorrectOption: {
    backgroundColor: '#F8D7DA', // 薄い赤
    borderColor: '#F5C6CB',
  },
  incorrectOptionText: {
    color: '#721C24', // 濃い赤
    fontWeight: 'bold',
  },
  disabledOption: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
  },
  buttonBase: { // 汎用ボタンスタイル
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180, // 最小幅
  },
  actionButton: {
    backgroundColor: '#007AFF', // iOS Blue
  },
  nextButton: {
    alignSelf: 'center', // 中央寄せ
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
  },
  // secondaryButton: {
  //   backgroundColor: '#FFFFFF',
  //   borderColor: '#007AFF',
  //   borderWidth: 1,
  //   marginTop: 15,
  // },
  // secondaryButtonText: {
  //   color: '#007AFF',
  // },
});