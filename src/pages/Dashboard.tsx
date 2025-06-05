import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Zap, Calendar, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Module, Badge, Progress } from '../types';
import database from '../db/database';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recommendedModules, setRecommendedModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedModulesCount, setCompletedModulesCount] = useState(0);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        console.log('Loading dashboard data for user:', currentUser.id);
        setIsLoading(true);
        setError(null);

        // Load all data concurrently
        const [userBadges, userProgress, allModules] = await Promise.all([
          database.getUserBadges(currentUser.id),
          database.getUserProgress(currentUser.id),
          database.getModules()
        ]);

        console.log('Loaded user badges:', userBadges);
        console.log('Loaded user progress:', userProgress);
        console.log('Loaded all modules:', allModules);

        setBadges(userBadges);
        setProgress(userProgress);
        setModules(allModules);

        // Calculate completed modules
        const completed = userProgress.filter(p => p.completed).length;
        console.log('Completed modules count:', completed);
        setCompletedModulesCount(completed);

        // Generate recommended modules
        const completedModuleIds = userProgress
          .filter(p => p.completed)
          .map(p => p.module_id);
        
        console.log('Completed module IDs:', completedModuleIds);
        
        const incomplete = allModules.filter(
          module => !completedModuleIds.includes(module.id)
        );
        
        console.log('Incomplete modules:', incomplete);
        setRecommendedModules(incomplete.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className={`h-8 w-8 ${currentTheme.text} animate-spin mx-auto mb-4`} />
          <p className={`${currentTheme.text}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={`${currentTheme.buttonPrimary} px-4 py-2 rounded-lg`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const calculateLevelProgress = () => {
    const xp = currentUser.xp || 0;
    const xpPerLevel = 1000;
    const currentLevel = Math.floor(xp / xpPerLevel);
    const progress = (xp % xpPerLevel) / xpPerLevel * 100;
    return {
      level: currentLevel + 1,
      progress,
      nextLevelXP: (currentLevel + 1) * xpPerLevel,
      remainingXP: (currentLevel + 1) * xpPerLevel - xp
    };
  };

  const levelInfo = calculateLevelProgress();
  
  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Welcome back, {currentUser.username}!
      </motion.h1>
      
      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed Modules</p>
              <p className="text-2xl font-bold">
                {completedModulesCount} / {modules.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <Zap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <p className="text-sm text-gray-500">Level {levelInfo.level}</p>
                <p className="text-sm text-gray-500">{currentUser.xp} XP</p>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  className="h-full bg-green-500 transition-all duration-300"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelInfo.remainingXP} XP to level {levelInfo.level + 1}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Badges Earned</p>
              <p className="text-2xl font-bold">{badges.length}</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Recent Activity and Recommended Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {progress.filter(item => item.completed).length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {progress
                    .filter(item => item.completed)
                    .sort((a, b) => new Date(b.last_attempt).getTime() - new Date(a.last_attempt).getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <motion.div
                        key={item.module_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <div className="p-2 rounded-full bg-gray-100 text-gray-500 mr-3">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            Completed module: {item.module_title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Score: {item.score}% • {formatDate(item.last_attempt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed modules yet. Start learning!</p>
                  <Link 
                    to="/modules" 
                    className="inline-flex items-center mt-4 text-blue-500 hover:text-blue-700"
                  >
                    Browse modules
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Recommended Modules */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Recommended Modules</h2>
          </div>
          
          <div className="p-6">
            <AnimatePresence mode="wait">
              {recommendedModules.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {recommendedModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={`/modules/${module.id}`}
                        className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-800">{module.title}</h3>
                            <p className="text-sm text-gray-500">
                              {module.category} • {module.difficulty}
                            </p>
                          </div>
                          <div className="flex items-center text-green-500">
                            <span className="mr-1">{module.xp_reward} XP</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">You've completed all available modules!</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Check back later for new content.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;