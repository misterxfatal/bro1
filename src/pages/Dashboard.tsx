import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Zap, Calendar, ArrowRight, Loader, TrendingUp, Target, Clock } from 'lucide-react';
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
          <p className={`${currentTheme.textMuted}`}>Loading your dashboard...</p>
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
    <div className="max-w-7xl mx-auto space-professional">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl sm:text-4xl font-bold ${currentTheme.text} mb-2`}>
          Welcome back, {currentUser.username}! 👋
        </h1>
        <p className={`text-lg ${currentTheme.textMuted}`}>
          Ready to continue your cybersecurity journey?
        </p>
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} p-6 rounded-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
              <BookOpen className={`h-6 w-6 ${currentTheme.info}`} />
            </div>
            <div className={`badge-professional-primary`}>
              {Math.round((completedModulesCount / modules.length) * 100)}%
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${currentTheme.cardText} mb-1`}>
              {completedModulesCount}
            </p>
            <p className={`text-sm ${currentTheme.cardTextMuted}`}>
              Modules Completed
            </p>
            <p className={`text-xs ${currentTheme.cardTextSecondary} mt-1`}>
              of {modules.length} total
            </p>
          </div>
        </div>
        
        <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} p-6 rounded-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
              <Zap className={`h-6 w-6 ${currentTheme.warning}`} />
            </div>
            <div className={`badge-professional-warning`}>
              Level {levelInfo.level}
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${currentTheme.cardText} mb-1`}>
              {currentUser.xp}
            </p>
            <p className={`text-sm ${currentTheme.cardTextMuted}`}>
              Experience Points
            </p>
            <div className="mt-3">
              <div className={`progress-bar`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  className="progress-bar-fill bg-gradient-to-r from-amber-500 to-orange-600"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className={`text-xs ${currentTheme.cardTextSecondary} mt-1`}>
                {levelInfo.remainingXP} XP to level {levelInfo.level + 1}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} p-6 rounded-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
              <Award className={`h-6 w-6 ${currentTheme.success}`} />
            </div>
            <div className={`badge-professional-success`}>
              Earned
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${currentTheme.cardText} mb-1`}>
              {badges.length}
            </p>
            <p className={`text-sm ${currentTheme.cardTextMuted}`}>
              Badges Earned
            </p>
            <p className={`text-xs ${currentTheme.cardTextSecondary} mt-1`}>
              Keep learning to earn more!
            </p>
          </div>
        </div>

        <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} p-6 rounded-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
              <TrendingUp className={`h-6 w-6 ${currentTheme.info}`} />
            </div>
            <div className={`badge-professional-primary`}>
              Active
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold ${currentTheme.cardText} mb-1`}>
              {progress.filter(p => !p.completed).length}
            </p>
            <p className={`text-sm ${currentTheme.cardTextMuted}`}>
              In Progress
            </p>
            <p className={`text-xs ${currentTheme.cardTextSecondary} mt-1`}>
              Modules started
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} rounded-xl`}>
            <div className="p-6 border-b ${currentTheme.divider}">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${currentTheme.surface}`}>
                    <Clock className={`h-5 w-5 ${currentTheme.text}`} />
                  </div>
                  <h2 className={`text-xl font-semibold ${currentTheme.cardText}`}>Recent Activity</h2>
                </div>
                <Link 
                  to="/modules" 
                  className={`text-sm ${currentTheme.info} hover:underline`}
                >
                  View all modules
                </Link>
              </div>
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
                          className={`flex items-center space-x-4 p-4 rounded-xl ${currentTheme.surface} hover:${currentTheme.surfaceHover} transition-colors`}
                        >
                          <div className={`p-2 rounded-lg ${currentTheme.success.replace('text-', 'bg-')} bg-opacity-10`}>
                            <Award className={`h-5 w-5 ${currentTheme.success}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${currentTheme.cardText} text-sm sm:text-base truncate`}>
                              Completed: {item.module_title}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-sm ${currentTheme.success} font-medium`}>
                                Score: {item.score}%
                              </span>
                              <span className={`text-sm ${currentTheme.cardTextMuted}`}>
                                {formatDate(item.last_attempt)}
                              </span>
                            </div>
                          </div>
                          <div className={`badge-professional-success`}>
                            ✓
                          </div>
                        </motion.div>
                      ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <div className={`p-4 rounded-full ${currentTheme.surface} w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                      <Calendar className={`h-8 w-8 ${currentTheme.textMuted}`} />
                    </div>
                    <h3 className={`text-lg font-medium ${currentTheme.cardText} mb-2`}>No completed modules yet</h3>
                    <p className={`${currentTheme.cardTextMuted} mb-4`}>Start your learning journey today!</p>
                    <Link 
                      to="/modules" 
                      className={`${currentTheme.buttonPrimary} inline-flex items-center space-x-2 touch-manipulation`}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Browse Modules</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        {/* Recommended Modules */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className={`${currentTheme.cardBg} ${currentTheme.cardShadow} rounded-xl`}>
            <div className="p-6 border-b ${currentTheme.divider}">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${currentTheme.surface}`}>
                  <Target className={`h-5 w-5 ${currentTheme.text}`} />
                </div>
                <h2 className={`text-xl font-semibold ${currentTheme.cardText}`}>Recommended</h2>
              </div>
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
                          className={`block p-4 rounded-xl ${currentTheme.surface} hover:${currentTheme.surfaceHover} transition-all duration-200 touch-manipulation group`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium ${currentTheme.cardText} text-sm line-clamp-2 group-hover:${currentTheme.info} transition-colors`}>
                                {module.title}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`badge-professional-primary text-xs`}>
                                  {module.category}
                                </span>
                                <span className={`text-xs ${currentTheme.cardTextMuted}`}>
                                  {module.difficulty}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className={`h-4 w-4 ${currentTheme.textMuted} group-hover:${currentTheme.info} transition-colors flex-shrink-0 ml-2`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Zap className={`h-4 w-4 ${currentTheme.warning}`} />
                              <span className={`text-sm font-medium ${currentTheme.cardText}`}>
                                {module.xp_reward} XP
                              </span>
                            </div>
                            <span className={`text-xs ${currentTheme.cardTextSecondary}`}>
                              {Math.floor((module.time_limit || 0) / 60)} min
                            </span>
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
                    <div className={`p-4 rounded-full ${currentTheme.surface} w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                      <BookOpen className={`h-8 w-8 ${currentTheme.textMuted}`} />
                    </div>
                    <h3 className={`text-lg font-medium ${currentTheme.cardText} mb-2`}>All caught up!</h3>
                    <p className={`${currentTheme.cardTextMuted} text-sm`}>
                      You've completed all available modules. Check back later for new content!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;