import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shield, BookOpen, Award, Users, LogOut, Code, Home, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../db/database';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [userXP, setUserXP] = useState(currentUser?.xp || 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
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
    { to: "/editor", icon: Code, label: "Module Editor" },
    { to: "/leaderboard", icon: Users, label: "Leaderboard" },
    { to: "/badges", icon: Award, label: "Badges" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`flex min-h-screen ${currentTheme.bgPrimary}`}>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 ${currentTheme.bgSecondary} ${
          isScrolled ? 'shadow-lg' : ''
        } transition-shadow duration-300`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg ${currentTheme.buttonSecondary}`}
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${currentTheme.text}`} />
            ) : (
              <Menu className={`h-6 w-6 ${currentTheme.text}`} />
            )}
          </button>
          <div className="flex items-center space-x-2">
            <Shield className={`h-6 w-6 ${currentTheme.text}`} />
            <span className={`font-bold ${currentTheme.text}`}>NetSpectres</span>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </motion.div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar content */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed lg:relative w-72 h-screen ${currentTheme.bgSecondary} ${
                currentTheme.text
              } z-50 lg:z-auto flex flex-col`}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield className={`h-8 w-8 ${currentTheme.text}`} />
                    <h1 className="text-xl font-bold">NetSpectres Academy</h1>
                  </motion.div>
                  
                  <div className={`mt-6 border-t border-opacity-20 pt-4 ${currentTheme.border}`}>
                    <p className={`text-sm ${currentTheme.text} opacity-75`}>Logged in as</p>
                    <p className="font-medium">{currentUser?.username}</p>
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

                <nav className="px-2">
                  {navigationItems.map(({ to, icon: Icon, label }) => (
                    <motion.div
                      key={to}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <NavLink
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                            isActive
                              ? `${currentTheme.buttonPrimary}`
                              : `${currentTheme.text} opacity-75 hover:opacity-100`
                          }`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                        end
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {label}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>
              </div>

              <motion.div
                className={`p-4 border-t ${currentTheme.border}`}
                whileHover={{ scale: 1.02 }}
              >
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-3 rounded-lg ${currentTheme.text} opacity-75 hover:opacity-100 hover:bg-opacity-10 hover:bg-white transition-all duration-200`}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 min-w-0"
      >
        <main className={`p-4 lg:p-6 ${isMobileMenuOpen ? 'blur-sm' : ''} transition-all duration-200 mt-16 lg:mt-0`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;