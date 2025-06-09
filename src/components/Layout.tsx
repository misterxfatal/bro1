import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, BookOpen, Award, Users, LogOut, Code, Home, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../db/database';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentTheme } = useTheme();
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

  return (
    <div className={`flex min-h-screen ${currentTheme.bgPrimary}`}>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 ${currentTheme.bgSecondary} ${
          isScrolled ? 'shadow-lg' : ''
        } transition-all duration-300 border-b ${currentTheme.border}`}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg ${currentTheme.buttonSecondary} touch-manipulation`}
            aria-label="Toggle menu"
          >
            <Menu className={`h-6 w-6 ${currentTheme.text}`} />
          </button>
          <div className="flex items-center space-x-2 min-w-0">
            <Shield className={`h-6 w-6 ${currentTheme.text}`} />
            <span className={`font-bold ${currentTheme.text} text-sm sm:text-base truncate`}>NetSpectres</span>
          </div>
          <div className="w-10 flex justify-end">
            <div className={`text-xs ${currentTheme.text} opacity-75 hidden sm:block`}>
              {userXP} XP
            </div>
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
            } flex flex-col shadow-xl`}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Shield className={`h-8 w-8 ${currentTheme.text}`} />
                  <h1 className="text-lg sm:text-xl font-bold truncate">NetSpectres Academy</h1>
                </motion.div>
                
                <div className={`mt-6 border-t border-opacity-20 pt-4 ${currentTheme.border}`}>
                  <p className={`text-sm ${currentTheme.text} opacity-75`}>Logged in as</p>
                  <p className="font-medium truncate">{currentUser?.username}</p>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm ${currentTheme.text} opacity-75`}>XP:</span>
                      <span className={`${currentTheme.text} font-bold`}>{userXP}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((userXP / 1000) * 100, 100)}%` }}
                        className={`h-full ${currentTheme.buttonPrimary}`}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <nav className="px-2 sm:px-4">
                {[...navItems, { to: "/settings", icon: Settings, label: "Settings" }].map(({ to, icon: Icon, label }) => (
                  <motion.div
                    key={to}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-200 touch-manipulation ${
                          isActive
                            ? `${currentTheme.buttonPrimary}`
                            : `${currentTheme.text} opacity-75 hover:opacity-100`
                        }`
                      }
                      end
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </div>

            <motion.div
              className={`p-4 sm:p-6 border-t ${currentTheme.border}`}
              whileHover={{ scale: 1.02 }}
            >
              <button
                onClick={handleLogout}
                className={`flex items-center w-full px-4 py-3 rounded-lg ${currentTheme.text} opacity-75 hover:opacity-100 hover:bg-opacity-10 hover:bg-white transition-all duration-200 touch-manipulation`}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="truncate">Logout</span>
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
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`mobile-menu fixed bottom-0 left-0 right-0 ${currentTheme.bgSecondary} z-50 rounded-t-2xl shadow-2xl max-h-96 overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Shield className={`h-8 w-8 ${currentTheme.text}`} />
                    <div>
                      <h2 className={`text-lg font-bold ${currentTheme.text}`}>NetSpectres</h2>
                      <p className={`text-sm ${currentTheme.text} opacity-75`}>{currentUser?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-2 rounded-lg ${currentTheme.buttonSecondary}`}
                  >
                    <X className={`h-6 w-6 ${currentTheme.text}`} />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${currentTheme.text} opacity-75`}>XP Progress</span>
                    <span className={`${currentTheme.text} font-bold`}>{userXP}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((userXP / 1000) * 100, 100)}%` }}
                      className={`h-full ${currentTheme.buttonPrimary}`}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? `${currentTheme.buttonPrimary}`
                          : `${currentTheme.text} opacity-75 hover:opacity-100`
                      }`
                    }
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Settings</span>
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-3 rounded-lg ${currentTheme.text} opacity-75 hover:opacity-100 hover:bg-opacity-10 hover:bg-white transition-all duration-200`}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
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
          className={`fixed bottom-0 left-0 right-0 ${currentTheme.bgSecondary} border-t ${currentTheme.border} z-30 safe-area-inset-bottom`}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
              
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-manipulation min-w-0 flex-1 ${
                    isActive
                      ? `${currentTheme.buttonPrimary} shadow-lg`
                      : `${currentTheme.text} opacity-60 hover:opacity-100`
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
        <main className={`p-3 sm:p-4 lg:p-6 transition-all duration-200 ${
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