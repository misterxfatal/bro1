import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className={`bg-${currentTheme.bgSecondary} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center mb-6">
          <SettingsIcon className={`h-8 w-8 ${currentTheme.text} mr-3`} />
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>Interface Settings</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(availableThemes).map(([key, theme]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-lg cursor-pointer ${
                currentTheme.name === theme.name
                  ? `ring-2 ring-${theme.accent}-500 ${theme.bgPrimary}`
                  : theme.bgPrimary
              }`}
              onClick={() => setTheme(key)}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-full h-20 rounded-lg ${theme.bgSecondary}`}></div>
                <span className={`font-medium ${theme.text}`}>{theme.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;