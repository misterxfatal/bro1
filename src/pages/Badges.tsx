import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Award, Lock, Loader } from 'lucide-react';
import database from '../db/database';

const Badges: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const fetchedAllBadges = await database.getAllBadges();
        setAllBadges(fetchedAllBadges);

        if (currentUser) {
          const fetchedUserBadges = await database.getUserBadges(currentUser.id);
          setUserBadges(fetchedUserBadges);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [currentUser]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className={`h-8 w-8 ${currentTheme.text} animate-spin`} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <h1 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>Achievement Badges</h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {allBadges.map(badge => {
          const earned = userBadges.some(ub => ub.id === badge.id);
          
          return (
            <motion.div
              key={badge.id}
              variants={item}
              className={`${currentTheme.bgSecondary} rounded-lg p-6 ${
                earned ? 'border-2 border-' + currentTheme.accent + '-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {earned ? (
                    <Award className={`h-8 w-8 ${currentTheme.text}`} />
                  ) : (
                    <Lock className="h-8 w-8 text-gray-500" />
                  )}
                  <h3 className={`ml-3 text-xl font-bold ${currentTheme.text}`}>
                    {badge.name}
                  </h3>
                </div>
              </div>

              <p className={`${currentTheme.text} opacity-75 mb-4`}>
                {badge.description}
              </p>

              <div className={`text-sm ${currentTheme.text} opacity-50`}>
                {earned ? (
                  <span>Earned on {new Date(badge.earned_at!).toLocaleDateString()}</span>
                ) : (
                  <span>
                    Progress: {currentUser?.xp || 0}/{badge.requirement_value} {badge.requirement}
                  </span>
                )}
              </div>

              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${currentTheme.buttonPrimary}`}
                  style={{
                    width: `${Math.min(
                      ((currentUser?.xp || 0) / badge.requirement_value) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Badges;