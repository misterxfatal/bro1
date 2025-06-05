import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Module } from '../types';
import database from '../db/database';
import quizStorage from '../db/quizStorage';
import { motion } from 'framer-motion';

interface QuestionForm {
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

const ModuleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [xpReward, setXpReward] = useState(50);
  const [timeLimit, setTimeLimit] = useState(1800);
  const [passingScore, setPassingScore] = useState(70);
  const [randomize, setRandomize] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 60 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const loadModuleData = async () => {
      if (id && currentUser) {
        try {
          setIsEditing(true);
          setIsLoading(true);
          
          const module = await database.getModuleById(id);
          if (module) {
            setTitle(module.title);
            setDescription(module.description);
            setCategory(module.category);
            setDifficulty(module.difficulty);
            setXpReward(module.xp_reward);
            setTimeLimit(module.time_limit || 1800);
            setPassingScore(module.passing_score);
            setRandomize(module.randomize);
            setInstantFeedback(module.instant_feedback);
            
            const moduleQuestions = await quizStorage.getAllQuestions(id);
            if (moduleQuestions && moduleQuestions.length > 0) {
              const formattedQuestions = moduleQuestions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                timeLimit: q.timeLimit
              }));
              
              setQuestions(formattedQuestions);
            }
          }
        } catch (error) {
          console.error('Error loading module:', error);
          setError('Failed to load module data');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadModuleData();
  }, [id, currentUser]);
  
  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: string | number) => {
    const updatedQuestions = [...questions];
    
    if (field === 'question') {
      updatedQuestions[index].question = value as string;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = value as number;
    } else if (field === 'timeLimit') {
      updatedQuestions[index].timeLimit = value as number;
    }
    
    setQuestions(updatedQuestions);
  };
  
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };
  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 60 }
    ]);
  };
  
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };
  
  const validateForm = () => {
    if (!title.trim()) return 'Module title is required';
    if (!description.trim()) return 'Module description is required';
    if (!category.trim()) return 'Category is required';
    if (xpReward <= 0) return 'XP reward must be greater than 0';
    if (timeLimit <= 0) return 'Time limit must be greater than 0';
    if (passingScore < 0 || passingScore > 100) return 'Passing score must be between 0 and 100';
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      if (q.timeLimit <= 0) return `Question ${i + 1} time limit must be greater than 0`;
      
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) return `Option ${j + 1} for question ${i + 1} is required`;
      }
    }
    
    return '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create modules');
      }
      
      const moduleData: Partial<Module> = {
        title,
        description,
        category,
        difficulty,
        xp_reward: xpReward,
        time_limit: timeLimit,
        passing_score: passingScore,
        randomize,
        instant_feedback: instantFeedback,
        created_by: currentUser.id
      };
      
      let moduleId = id;
      let module: Module | null = null;
      
      if (isEditing && id) {
        module = await database.updateModule(id, moduleData);
        if (!module) throw new Error('Failed to update module');
        moduleId = id;
      } else {
        module = await database.createModule(moduleData as Omit<Module, 'id' | 'created_at'>);
        if (!module) throw new Error('Failed to create module');
        moduleId = module.id;
      }

      // Save questions to quizStorage
      await quizStorage.saveQuestions(moduleId, questions);
      
      navigate('/modules');
    } catch (error) {
      console.error('Error saving module:', error);
      setError('An error occurred while saving the module');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this module?')) return;
    
    try {
      setIsLoading(true);
      await quizStorage.deleteQuestions(id);
      const success = await database.deleteModule(id);
      if (success) {
        navigate('/modules');
      } else {
        setError('Failed to delete module');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      setError('An error occurred while deleting the module');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <button
        onClick={() => navigate('/modules')}
        className={`inline-flex items-center ${currentTheme.text} hover:opacity-80 mb-6`}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Modules
      </button>
      
      <div className={`${currentTheme.bgSecondary} rounded-lg shadow-lg overflow-hidden`}>
        <div className={`${currentTheme.buttonPrimary} p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4`}>
          <h1 className={`text-xl sm:text-2xl font-bold ${currentTheme.text}`}>
            {isEditing ? 'Edit Module' : 'Create New Module'}
          </h1>
          {isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 w-full sm:w-auto"
            >
              Delete Module
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="title">
              Module Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              placeholder="e.g., Introduction to Linux"
            />
          </div>
          
          <div className="mb-6">
            <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              rows={4}
              placeholder="Describe what users will learn in this module"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div>
              <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="category">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
                placeholder="e.g., Linux, Web, OSINT"
              />
            </div>
            
            <div>
              <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="difficulty">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="xpReward">
                XP Reward
              </label>
              <input
                type="number"
                id="xpReward"
                value={xpReward}
                onChange={(e) => setXpReward(parseInt(e.target.value))}
                min="1"
                className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              />
            </div>

            <div>
              <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="timeLimit">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                id="timeLimit"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                min="60"
                step="60"
                className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div>
              <label className={`block ${currentTheme.text} font-medium mb-2`} htmlFor="passingScore">
                Passing Score (%)
              </label>
              <input
                type="number"
                id="passingScore"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value))}
                min="0"
                max="100"
                className={`w-full ${currentTheme.bgPrimary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="randomize"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="mr-2"
              />
              <label className={`${currentTheme.text} font-medium`} htmlFor="randomize">
                Randomize Questions
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="instantFeedback"
                checked={instantFeedback}
                onChange={(e) => setInstantFeedback(e.target.checked)}
                className="mr-2"
              />
              <label className={`${currentTheme.text} font-medium`} htmlFor="instantFeedback">
                Show Instant Feedback
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className={`text-xl font-semibold ${currentTheme.text}`}>Quiz Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className={`inline-flex items-center px-3 py-1 ${currentTheme.buttonSecondary} rounded-md hover:opacity-80 w-full sm:w-auto justify-center`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </button>
            </div>
            
            {questions.map((q, qIndex) => (
              <div key={qIndex} className={`${currentTheme.bgPrimary} p-4 rounded-lg mb-4`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h3 className={`font-medium ${currentTheme.text}`}>Question {qIndex + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className={`block ${currentTheme.text} mb-2`} htmlFor={`question-${qIndex}`}>
                    Question Text
                  </label>
                  <input
                    type="text"
                    id={`question-${qIndex}`}
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className={`w-full ${currentTheme.bgSecondary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
                    placeholder="Enter your question"
                  />
                </div>

                <div className="mb-4">
                  <label className={`block ${currentTheme.text} mb-2`} htmlFor={`timeLimit-${qIndex}`}>
                    Question Time Limit (seconds)
                  </label>
                  <div className="flex items-center">
                    <Timer className={`h-5 w-5 ${currentTheme.text} mr-2`} />
                    <input
                      type="number"
                      id={`timeLimit-${qIndex}`}
                      value={q.timeLimit}
                      onChange={(e) => handleQuestionChange(qIndex, 'timeLimit', parseInt(e.target.value))}
                      min="10"
                      className={`w-32 ${currentTheme.bgSecondary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block ${currentTheme.text} mb-2`}>Answer Options</label>
                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`correct-${qIndex}-${oIndex}`}
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          className={`flex-1 ${currentTheme.bgSecondary} ${currentTheme.text} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500`}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className={`text-sm ${currentTheme.text} opacity-75 mt-1`}>
                    Select the radio button next to the correct answer.
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 ${currentTheme.buttonPrimary} rounded-md hover:opacity-80 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleEditor;