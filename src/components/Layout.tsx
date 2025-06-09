import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Award, Users, LogOut, Code, Home, Settings, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../db/database';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [userXP, setUserXP] = useState(currentUser?.xp || 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const updateUserXP = async () => {
      if (currentUser?.id) {
        const user = await database.getUser(currentUser.id);
        if (user) {
          setUserXP(user.xp);
        }
      }
    };

    updateUserXP();
    const interval = setInterval(updateUserXP, 5000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [currentUser]);

  // Update XP when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserXP(currentUser.xp);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/modules", icon: BookOpen, label: "Modules" },
    { to: "/leaderboard", icon: Users, label: "Leaderboard" },
    { to: "/badges", icon: Award, label: "Badges" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  // Add editor for admin users
  const adminNavigationItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/modules", icon: BookOpen, label: "Modules" },
    { to: "/editor", icon: Code, label: "Editor" },
    { to: "/leaderboard", icon: Users, label: "Leaderboard" },
    { to: "/badges", icon: Award, label: "Badges" }
  ];

  const isAdmin = currentUser?.role === 'admin';
  const navItems = isAdmin ? adminNavigationItems : navigationItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const calculateLevel = () => {
    const xpPerLevel = 1000;
    const currentLevel = Math.floor(userXP / xpPerLevel);
    const progress = (userXP % xpPerLevel) / xpPerLevel * 100;
    return {
      level: currentLevel + 1,
      progress,
      nextLevelXP: (currentLevel + 1) * xpPerLevel,
      remainingXP: (currentLevel + 1) * xpPerLevel - userXP
    };
  };

  const levelInfo = calculateLevel();

  return (
    <div className={`flex min-h-screen ${currentTheme.bgPrimary} transition-colors duration-300`}>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 ${
          isScrolled ? 'glass-effect' : currentTheme.bgSecondary
        } ${currentTheme.border} border-b transition-all duration-300`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={toggleMobileMenu}
            className={`p-2.5 rounded-xl ${currentTheme.buttonSecondary} touch-manipulation`}
            aria-label="Toggle menu"
          >
            <Menu className={`h-5 w-5 ${currentTheme.text}`} />
          </button>
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`p-2 rounded-xl ${currentTheme.surface}`}>
              <Shield className={`h-5 w-5 ${currentTheme.text}`} />
            </div>
            <div className="min-w-0">
              <span className={`font-semibold ${currentTheme.text} text-sm sm:text-base truncate block`}>
                NetSpectres Academy
              </span>
              <span className={`${currentTheme.textMuted} text-xs hidden sm:block`}>
                Level {levelInfo.level}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`text-xs ${currentTheme.textMuted} hidden sm:block`}>
              {userXP} XP
            </div>
            <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        {!isMobile && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            className={`relative w-72 sm:w-80 lg:w-72 h-screen ${currentTheme.bgSecondary} ${
              currentTheme.text
            } flex flex-col ${currentTheme.shadow} border-r ${currentTheme.border}`}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <motion.div
                  className="flex items-center space-x-3 mb-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
                    <Shield className={`h-6 w-6 ${currentTheme.text}`} />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold truncate">NetSpectres Academy</h1>
                    <p className={`text-sm ${currentTheme.textMuted}`}>Cybersecurity Training</p>
                  </div>
                </motion.div>
                
                <div className={`p-4 rounded-xl ${currentTheme.surface} mb-6`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${currentTheme.bgPrimary} flex items-center justify-center`}>
                      <span className={`text-sm font-semibold ${currentTheme.text}`}>
                        {currentUser?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${currentTheme.text} truncate`}>{currentUser?.username}</p>
                      <p className={`text-sm ${currentTheme.textMuted}`}>Level {levelInfo.level}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className={`h-4 w-4 ${currentTheme.warning}`} />
                      <span className={`text-sm font-semibold ${currentTheme.text}`}>{userXP}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={currentTheme.textMuted}>Progress to Level {levelInfo.level + 1}</span>
                      <span className={currentTheme.textMuted}>{levelInfo.remainingXP} XP remaining</span>
                    </div>
                    <div className={`progress-bar ${currentTheme.surface}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        className="progress-bar-fill bg-gradient-to-r from-blue-500 to-purple-600"
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <nav className="px-4 pb-4">
                <div className="space-y-1">
                  {[...navItems, { to: "/settings", icon: Settings, label: "Settings" }].map(({ to, icon: Icon, label }) => (
                    <motion.div
                      key={to}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 rounded-xl transition-all duration-200 touch-manipulation group ${
                            isActive
                              ? `${currentTheme.buttonPrimary}`
                              : `${currentTheme.text} opacity-70 hover:opacity-100 ${currentTheme.surfaceHover}`
                          }`
                        }
                        end
                      >
                        <Icon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                        <span className="font-medium truncate">{label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </nav>
            </div>

            <motion.div
              className={`p-4 border-t ${currentTheme.divider}`}
              whileHover={{ scale: 1.01 }}
            >
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 rounded-xl ${currentTheme.text} opacity-70 hover:opacity-100 ${currentTheme.surfaceHover} transition-all duration-200 touch-manipulation group`}
              >
                <LogOut className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                <span className="font-medium truncate">Logout</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Settings Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`mobile-menu fixed bottom-0 left-0 right-0 ${currentTheme.bgSecondary} z-50 rounded-t-3xl ${currentTheme.shadow} max-h-96 overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${currentTheme.surface}`}>
                      <Shield className={`h-6 w-6 ${currentTheme.text}`} />
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${currentTheme.text}`}>NetSpectres</h2>
                      <p className={`text-sm ${currentTheme.textMuted}`}>{currentUser?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-xl ${currentTheme.buttonSecondary}`}
                  >
                    <X className={`h-5 w-5 ${currentTheme.text}`} />
                  </button>
                </div>

                <div className={`p-4 rounded-xl ${currentTheme.surface} mb-6`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${currentTheme.textMuted}`}>Level {levelInfo.level} Progress</span>
                    <div className="flex items-center space-x-1">
                      <Zap className={`h-4 w-4 ${currentTheme.warning}`} />
                      <span className={`font-semibold ${currentTheme.text}`}>{userXP}</span>
                    </div>
                  </div>
                  <div className={`progress-bar ${currentTheme.surface}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress}%` }}
                      className="progress-bar-fill bg-gradient-to-r from-blue-500 to-purple-600"
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className={`text-xs ${currentTheme.textMuted} mt-1`}>
                    {levelInfo.remainingXP} XP to next level
                  </p>
                </div>

                <div className="space-y-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${currentTheme.buttonPrimary}`
                          : `${currentTheme.text} opacity-75 hover:opacity-100 ${currentTheme.surfaceHover}`
                      }`
                    }
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="font-medium">Settings</span>
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-3 rounded-xl ${currentTheme.text} opacity-75 hover:opacity-100 ${currentTheme.surfaceHover} transition-all duration-200`}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className={`fixed bottom-0 left-0 right-0 mobile-bottom-nav z-30 safe-area-inset-bottom`}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
              
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 touch-manipulation min-w-0 flex-1 mx-1 ${
                    isActive
                      ? `${currentTheme.buttonPrimary} transform -translate-y-1`
                      : `${currentTheme.text} opacity-60 hover:opacity-100 ${currentTheme.surfaceHover}`
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : currentTheme.text}`} />
                  <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : currentTheme.text}`}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-w-0 w-full"
      >
        <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-200 ${
          isMobile ? 'mt-16 mb-20' : 'mt-16 lg:mt-0'
        } min-h-screen`}>
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;