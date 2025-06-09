import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Filter, Search, Timer, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Module, Progress } from '../types';
import database from '../db/database';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 9;

const ModulesList: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadModuleData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const allModules = await database.getModules();
        setModules(allModules);
        
        const uniqueCategories = Array.from(
          new Set(allModules.map(module => module.category))
        ).filter(Boolean);
        setCategories(uniqueCategories);
        
        const userProgress = await database.getUserProgress(currentUser.id);
        const progressRecord: Record<string, Progress> = {};
        userProgress.forEach(p => {
          progressRecord[p.module_id] = p;
        });
        
        setProgress(progressRecord);
      } catch (error) {
        console.error('Error loading module data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModuleData();
  }, [currentUser]);

  const handleDeleteModule = async (e: React.MouseEvent, moduleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(moduleId);
      await database.deleteModule(moduleId);
      
      setModules(prevModules => prevModules.filter(m => m.id !== moduleId));
      
      const remainingModules = modules.filter(m => m.id !== moduleId);
      const updatedCategories = Array.from(
        new Set(remainingModules.map(m => m.category))
      ).filter(Boolean);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Failed to delete module. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredModules = modules
    .filter(module => {
      const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          module.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const moduleProgress = progress[module.id];
      const isCompleted = moduleProgress?.completed || false;
      
      const matchesCompletionFilter = 
        filter === 'all' ||
        (filter === 'completed' && isCompleted) ||
        (filter === 'incomplete' && !isCompleted);
      
      const matchesCategory = 
        categoryFilter === 'all' || 
        module.category === categoryFilter;
      
      return matchesSearch && matchesCompletionFilter && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'xp':
          return b.xp_reward - a.xp_reward;
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const paginatedModules = filteredModules.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${currentTheme.bgPrimary} flex items-center justify-center`}>
        <div className={`${currentTheme.cardBg} rounded-lg ${currentTheme.shadow} p-8 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={`${currentTheme.text}`}>Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bgPrimary}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${currentTheme.text}`}>Learning Modules</h1>
          
          {isAdmin && (
            <Link to="/editor">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${currentTheme.buttonPrimary} px-4 py-2 rounded-lg flex items-center touch-manipulation w-full sm:w-auto justify-center`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Module
              </motion.button>
            </Link>
          )}
        </div>
        
        <div className={`${currentTheme.bgSecondary} rounded-lg ${currentTheme.shadow} p-4 sm:p-6 mb-6 sm:mb-8`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${currentTheme.text} opacity-50`} />
              </div>
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-lg border ${currentTheme.border} ${currentTheme.bgPrimary} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500 transition-all duration-200 text-sm sm:text-base`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className={`h-5 w-5 ${currentTheme.text} opacity-50`} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border ${currentTheme.border} ${currentTheme.bgPrimary} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500 text-sm sm:text-base`}
              >
                <option value="all">All Modules</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <BookOpen className={`h-5 w-5 ${currentTheme.text} opacity-50`} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border ${currentTheme.border} ${currentTheme.bgPrimary} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500 text-sm sm:text-base`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${currentTheme.text} opacity-50`} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 border ${currentTheme.border} ${currentTheme.bgPrimary} ${currentTheme.text} focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent}-500 text-sm sm:text-base`}
              >
                <option value="date">Latest First</option>
                <option value="title">Title A-Z</option>
                <option value="xp">XP Reward</option>
              </select>
            </div>
          </div>
        </div>
        
        {paginatedModules.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {paginatedModules.map(module => {
                const moduleProgress = progress[module.id];
                const isCompleted = moduleProgress?.completed || false;
                
                return (
                  <motion.div
                    key={module.id}
                    whileHover={{ y: -4 }}
                    className={`${currentTheme.cardBg} rounded-lg ${currentTheme.shadow} overflow-hidden transition-all duration-200 relative group ${
                      isCompleted ? 'bg-opacity-80' : ''
                    }`}
                  >
                    <Link to={`/modules/${module.id}`}>
                      <div className={`h-2 bg-gradient-to-r ${currentTheme.gradient}`} />
                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className={`text-base sm:text-lg font-medium ${currentTheme.text} pr-2 line-clamp-2`}>{module.title}</h2>
                          {isCompleted ? (
                            <div className={`${currentTheme.highlight} p-2 rounded-full bg-green-100`}>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ) : (
                            <div className={`${currentTheme.bgSecondary} p-2 rounded-full`}>
                              <Clock className={`h-5 w-5 ${currentTheme.text} opacity-75`} />
                            </div>
                          )}
                        </div>
                        
                        <p className={`${currentTheme.text} opacity-75 text-xs sm:text-sm mb-4 line-clamp-3`}>
                          {module.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 ${currentTheme.highlight} rounded-full ${currentTheme.text} truncate`}>
                            {module.category}
                          </span>
                          <span className={`text-xs sm:text-sm font-medium ${currentTheme.text} whitespace-nowrap`}>
                            {module.xp_reward} XP
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center">
                            <Timer className={`h-4 w-4 mr-2 ${currentTheme.text} opacity-75`} />
                            <span className={`${currentTheme.text} opacity-75`}>
                              {formatTime(module.time_limit || 0)}
                            </span>
                          </div>
                          <span className={`${currentTheme.text} opacity-75 hidden sm:inline`}>
                            {formatDate(module.created_at || '')}
                          </span>
                        </div>
                        
                        {moduleProgress && (
                          <div className={`mt-4 pt-4 border-t ${currentTheme.border}`}>
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className={`${currentTheme.text} opacity-75`}>
                                {isCompleted ? 'Completed' : 'In progress'}
                              </span>
                              {moduleProgress.score > 0 && (
                                <span className={`font-medium ${currentTheme.text}`}>
                                  Score: {moduleProgress.score}%
                                </span>
                              )}
                            </div>
                            {!isCompleted && moduleProgress.score > 0 && (
                              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-${currentTheme.accent}-600`}
                                  style={{ width: `${moduleProgress.score}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {isCompleted && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-50 dark:to-green-900/20 pointer-events-none" />
                        )}
                      </div>
                    </Link>
                    
                    {isAdmin && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full ${currentTheme.buttonSecondary} text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 touch-manipulation`}
                        onClick={(e) => handleDeleteModule(e, module.id)}
                        disabled={isDeleting === module.id}
                      >
                        {isDeleting === module.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`${currentTheme.buttonSecondary} p-2 rounded-full disabled:opacity-50 touch-manipulation`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className={`${currentTheme.text} text-sm sm:text-base`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`${currentTheme.buttonSecondary} p-2 rounded-full disabled:opacity-50 touch-manipulation`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`${currentTheme.cardBg} rounded-lg ${currentTheme.shadow} p-6 sm:p-8 text-center`}>
            <BookOpen className={`h-12 w-12 ${currentTheme.text} opacity-50 mx-auto mb-4`} />
            <h3 className={`text-base sm:text-lg font-medium ${currentTheme.text} mb-2`}>No modules found</h3>
            <p className={`${currentTheme.text} opacity-75 text-sm sm:text-base`}>
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesList;