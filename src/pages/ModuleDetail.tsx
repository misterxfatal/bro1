import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Award, AlertCircle, Timer, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Module, Question } from '../types';
import database from '../db/database';
import quizStorage from '../db/quizStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const ModuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, refreshUser } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [module, setModule] = useState<Module | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [isFirstCompletion, setIsFirstCompletion] = useState(true);

  useEffect(() => {
    const loadModuleData = async () => {
      if (!id || !currentUser) return;

      try {
        setIsLoading(true);
        setError(null);
        setQuestionsLoaded(false);

        const moduleData = await database.getModuleById(id);
        if (!moduleData) {
          setError('Module not found');
          return;
        }

        setModule(moduleData);
        setTimeRemaining(moduleData.time_limit || 1800);
        
        const storedQuestions = await quizStorage.getAllQuestions(id);
        if (!storedQuestions || storedQuestions.length === 0) {
          setError('No questions available for this module');
          return;
        }

        const transformedQuestions: Question[] = storedQuestions.map((q, index) => ({
          id: q.id,
          module_id: q.moduleId,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          time_limit: q.timeLimit,
          question_order: q.order
        }));

        const processedQuestions = moduleData.randomize 
          ? [...transformedQuestions].sort(() => Math.random() - 0.5)
          : transformedQuestions;

        setQuestions(processedQuestions);
        setQuestionsLoaded(true);
        setSelectedAnswers(new Array(processedQuestions.length).fill(-1));
        
        const userProgress = await database.getUserProgress(currentUser.id);
        const moduleProgress = userProgress.find(p => p.module_id === id);
        
        if (moduleProgress?.completed) {
          setQuizCompleted(true);
          setScore(moduleProgress.score);
          setIsFirstCompletion(false);
          setEarnedXP(Math.floor((moduleProgress.score / 100) * moduleData.xp_reward));
        }
      } catch (err) {
        console.error('Error loading module:', err);
        setError('Failed to load module data');
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleData();
  }, [id, currentUser]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizCompleted, timeRemaining]);

  const handleTimeUp = async () => {
    if (!module || !currentUser) return;
    
    const answeredQuestions = selectedAnswers.filter(answer => answer !== -1).length;
    const calculatedScore = Math.round((answeredQuestions / questions.length) * 100);
    
    const userProgress = await database.getUserProgress(currentUser.id);
    const moduleProgress = userProgress.find(p => p.module_id === module.id);
    const isFirstTime = !moduleProgress?.completed;
    
    const calculatedXP = isFirstTime && calculatedScore >= module.passing_score 
      ? Math.floor((calculatedScore / 100) * module.xp_reward)
      : 0;
    
    setScore(calculatedScore);
    setEarnedXP(calculatedXP);
    setQuizCompleted(true);
    setIsFirstCompletion(isFirstTime);
    
    await database.updateProgress(currentUser.id, module.id, true, calculatedScore);
    await refreshUser();
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (quizCompleted) return;
    
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });

    if (module?.instant_feedback && currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        handleNextQuestion();
      }, 500);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!module || !currentUser) return;
    
    console.log('Submitting quiz:', { moduleId: module.id, userId: currentUser.id });
    
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });
    
    const calculatedScore = Math.round((correctAnswers / questions.length) * 100);
    const passed = calculatedScore >= (module.passing_score || 70);
    
    console.log('Quiz results:', {
      correctAnswers,
      totalQuestions: questions.length,
      calculatedScore,
      passed,
      isFirstCompletion
    });

    setScore(calculatedScore);
    setQuizCompleted(true);

    console.log('Updating progress in database...');
    const progressUpdated = await database.updateProgress(
      currentUser.id,
      module.id,
      true,
      calculatedScore
    );
    console.log('Progress update result:', progressUpdated);
    
    if (passed && isFirstCompletion) {
      const earnedPoints = Math.floor((calculatedScore / 100) * module.xp_reward);
      console.log('XP earned:', earnedPoints);
      setEarnedXP(earnedPoints);
    } else {
      console.log('No XP awarded - already completed or did not pass');
      setEarnedXP(0);
    }

    await refreshUser();
    console.log('User data refreshed');
  };

  const formatTime = (seconds: number) => {
    return dayjs.duration(seconds, 'seconds').format('mm:ss');
  };

  const renderQuizContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <Loader className={`h-8 w-8 ${currentTheme.text} animate-spin mb-4`} />
          <p className={`${currentTheme.text} text-base sm:text-lg`}>Loading quiz...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6 sm:py-8">
          <AlertCircle className={`h-12 w-12 ${currentTheme.text} mx-auto mb-4`} />
          <p className={`${currentTheme.text} text-base sm:text-lg mb-2`}>{error}</p>
          <button
            onClick={() => navigate('/modules')}
            className={`mt-4 px-4 py-2 ${currentTheme.buttonPrimary} rounded-md touch-manipulation`}
          >
            Return to Modules
          </button>
        </div>
      );
    }

    if (!questionsLoaded || questions.length === 0) {
      return (
        <div className="text-center py-6 sm:py-8">
          <Loader className={`h-12 w-12 ${currentTheme.text} mx-auto mb-4 animate-spin`} />
          <p className={`${currentTheme.text} text-base sm:text-lg`}>Loading questions...</p>
        </div>
      );
    }

    if (quizCompleted) {
      return (
        <div className={`${currentTheme.highlight} rounded-lg p-4 sm:p-6 text-center`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center p-3 ${currentTheme.buttonPrimary} rounded-full mb-4`}
          >
            <CheckCircle className="h-8 w-8" />
          </motion.div>
          <h3 className={`text-lg sm:text-xl font-bold ${currentTheme.text} mb-2`}>Quiz Completed!</h3>
          <p className={`${currentTheme.text} opacity-75 mb-2 text-sm sm:text-base`}>
            You scored {score}%
          </p>
          {isFirstCompletion && earnedXP > 0 && (
            <p className={`text-${currentTheme.accent}-500 font-bold mb-4 text-sm sm:text-base`}>
              + {earnedXP} XP earned!
            </p>
          )}
          {!isFirstCompletion && (
            <p className={`${currentTheme.text} opacity-75 text-xs sm:text-sm mb-4`}>
              You've already completed this module. No additional XP awarded.
            </p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/modules')}
            className={`px-4 py-2 ${currentTheme.buttonPrimary} rounded-md touch-manipulation`}
          >
            Continue Learning
          </motion.button>
        </div>
      );
    }

    if (!quizStarted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${currentTheme.highlight} rounded-lg p-4 sm:p-6 text-center`}
        >
          <h3 className={`text-lg sm:text-xl font-bold ${currentTheme.text} mb-4`}>Ready to Start?</h3>
          <p className={`${currentTheme.text} opacity-75 mb-6 text-sm sm:text-base`}>
            This quiz contains {questions.length} questions.<br />
            You have {formatTime(module?.time_limit || 1800)} to complete it.<br />
            Each correct answer will earn you {Math.floor((module?.xp_reward || 0) / questions.length)} XP.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setQuizStarted(true)}
            className={`px-4 sm:px-6 py-2 sm:py-3 ${currentTheme.buttonPrimary} rounded-lg text-base sm:text-lg touch-manipulation`}
          >
            Start Quiz
          </motion.button>
        </motion.div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return (
        <div className="text-center py-6 sm:py-8">
          <AlertCircle className={`h-12 w-12 ${currentTheme.text} mx-auto mb-4`} />
          <p className={`${currentTheme.text} text-base sm:text-lg`}>Question not found</p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            <div className={`${currentTheme.highlight} rounded-lg p-3 sm:p-4 flex-1`}>
              <div className="flex items-center justify-center">
                <Timer className={`h-5 w-5 ${currentTheme.text} mr-2`} />
                <span className={`${currentTheme.text} font-medium text-sm sm:text-base`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            
            <div className={`${currentTheme.highlight} rounded-lg p-3 sm:p-4 flex-1`}>
              <div className="flex items-center justify-center">
                <Award className={`h-5 w-5 ${currentTheme.text} mr-2`} />
                <span className={`${currentTheme.text} font-medium text-sm sm:text-base`}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className={`${currentTheme.text}`}>Progress</span>
              <span className={`${currentTheme.text}`}>
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className={`w-full h-2 ${currentTheme.bgSecondary} rounded-full overflow-hidden`}>
              <motion.div
                className={`h-full ${currentTheme.buttonPrimary}`}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className={`${currentTheme.bgSecondary} p-4 sm:p-6 rounded-lg`}>
            <h3 className={`text-lg sm:text-xl font-medium ${currentTheme.text} mb-4 sm:mb-6`}>
              {currentQuestion.question}
            </h3>
            
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                  className={`p-3 sm:p-4 text-left rounded-lg transition touch-manipulation ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? `${currentTheme.buttonPrimary}`
                      : `${currentTheme.bgPrimary} hover:bg-opacity-75`
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 ${
                      selectedAnswers[currentQuestionIndex] === index 
                        ? `border-${currentTheme.accent}-500 bg-${currentTheme.accent}-500` 
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[currentQuestionIndex] === index && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className={`${currentTheme.text} text-sm sm:text-base`}>{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-md touch-manipulation order-2 sm:order-1 ${
                currentQuestionIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : currentTheme.buttonSecondary
              }`}
            >
              Previous
            </motion.button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className={`px-4 py-2 rounded-md ${currentTheme.buttonPrimary} touch-manipulation order-1 sm:order-2`}
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmitQuiz}
                className={`px-4 py-2 rounded-md ${currentTheme.buttonPrimary} touch-manipulation order-1 sm:order-2`}
              >
                Submit Quiz
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
      <button
        onClick={() => navigate('/modules')}
        className={`inline-flex items-center ${currentTheme.text} hover:opacity-80 mb-4 sm:mb-6 touch-manipulation`}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Modules
      </button>
      
      <div className={`${currentTheme.cardBg} rounded-lg ${currentTheme.shadow} overflow-hidden mb-6 sm:mb-8`}>
        <div className={`${currentTheme.buttonPrimary} p-4 sm:p-6`}>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
            {module?.title || 'Loading...'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm lg:text-base text-opacity-90">
            <BookOpen className="h-5 w-5" />
            <span>{module?.category}</span>
            <span className="mx-2">•</span>
            <span>{module?.difficulty}</span>
            <span className="mx-2">•</span>
            <span>{module?.xp_reward} XP</span>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 lg:p-6">
          {renderQuizContent()}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;