import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LeaderboardEntry } from '../types';
import database from '../db/database';
import { motion } from 'framer-motion';

const Leaderboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (currentUser) {
        const leaderboardData = await database.getLeaderboard();
        setLeaderboard(leaderboardData);
        
        const rank = leaderboardData.findIndex(entry => entry.id === currentUser.id);
        if (rank !== -1) {
          setUserRank(rank + 1);
        }
      }
    };

    fetchLeaderboard();
  }, [currentUser]);
  
  const getMedalColor = (position: number): string => {
    switch (position) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return `${currentTheme.text} opacity-50`;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className={`text-3xl font-bold ${currentTheme.text} mb-6`}>Leaderboard</h1>
      
      <div className={`${currentTheme.cardBg} rounded-lg ${currentTheme.shadow} overflow-hidden`}>
        <div className={`${currentTheme.buttonPrimary} p-6`}>
          <div className="flex items-center">
            <Trophy className="h-8 w-8 mr-3" />
            <h2 className="text-2xl font-bold">Top Hackers</h2>
          </div>
          <p className={`mt-2 ${currentTheme.text} opacity-75`}>
            Compete with others and climb the ranks by completing modules and earning XP.
          </p>
        </div>
        
        {leaderboard.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.id === currentUser?.id;
              
              return (
                <motion.div 
                  key={entry.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 flex items-center ${
                    isCurrentUser ? `${currentTheme.highlight}` : ''
                  }`}
                >
                  <div className="w-12 text-center">
                    {index < 3 ? (
                      <Medal className={`h-6 w-6 mx-auto ${getMedalColor(index)}`} />
                    ) : (
                      <span className={`${currentTheme.text} opacity-75 font-medium`}>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center">
                    <div className={`${currentTheme.bgSecondary} p-2 rounded-full mr-3`}>
                      <User className={`h-5 w-5 ${currentTheme.text}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isCurrentUser ? `text-${currentTheme.accent}-400` : currentTheme.text}`}>
                        {entry.username} {isCurrentUser && <span className="text-sm">(You)</span>}
                      </p>
                      <p className={`text-sm ${currentTheme.text} opacity-75`}>
                        {entry.modules_completed} modules completed
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold text-${currentTheme.accent}-400`}>{entry.xp} XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Trophy className={`h-12 w-12 ${currentTheme.text} opacity-30 mx-auto mb-4`} />
            <h3 className={`text-xl font-medium ${currentTheme.text} mb-2`}>No data yet</h3>
            <p className={`${currentTheme.text} opacity-75`}>
              Complete modules to appear on the leaderboard.
            </p>
          </div>
        )}
        
        {userRank !== null && userRank > 10 && (
          <div className={`${currentTheme.highlight} p-4 border-t ${currentTheme.border}`}>
            <div className="flex items-center">
              <div className="w-12 text-center">
                <span className={`${currentTheme.text} opacity-75 font-medium`}>{userRank}</span>
              </div>
              
              <div className="flex-1 flex items-center">
                <div className={`${currentTheme.bgSecondary} p-2 rounded-full mr-3`}>
                  <User className={`h-5 w-5 ${currentTheme.text}`} />
                </div>
                <div>
                  <p className={`font-medium text-${currentTheme.accent}-400`}>
                    {currentUser?.username} <span className="text-sm">(You)</span>
                  </p>
                  <p className={`text-sm ${currentTheme.text} opacity-75`}>
                    Keep going to climb the ranks!
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-xl font-bold text-${currentTheme.accent}-400`}>{currentUser?.xp} XP</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;