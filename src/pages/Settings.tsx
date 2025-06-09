import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Palette, Monitor, Moon, Gamepad2, Zap, Waves } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentTheme, setTheme, availableThemes, currentThemeName } = useTheme();

  const themeIcons = {
    light: Monitor,
    dark: Moon,
    modern: Palette,
    cyber: Zap,
    gaming: Gamepad2,
    neon: Zap,
    ocean: Waves
  };

  const themeDescriptions = {
    light: 'Clean and professional light theme',
    dark: 'Elegant dark theme for low-light environments',
    modern: 'Modern blue accent with professional styling',
    cyber: 'Matrix-inspired cyberpunk theme with green neon',
    gaming: 'RGB gaming theme with animated gradients',
    neon: 'Synthwave-inspired neon pink and cyan',
    ocean: 'Deep ocean blues with cyan accents'
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgPrimary} ${currentTheme.backgroundPattern}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className={`${currentTheme.cardBg} rounded-2xl ${currentTheme.shadow} p-6 sm:p-8`}>
          <div className="flex items-center mb-8">
            <div className={`p-3 rounded-xl ${currentTheme.surface} mr-4`}>
              <SettingsIcon className={`h-8 w-8 ${currentTheme.text}`} />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${currentTheme.text}`}>Interface Settings</h1>
              <p className={`${currentTheme.textMuted} mt-1`}>Customize your experience with professional themes</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-4`}>Theme Selection</h2>
            <p className={`${currentTheme.textMuted} mb-6`}>
              Choose from our collection of professionally designed themes, each optimized for different use cases and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(availableThemes).map(([key, theme]) => {
              const IconComponent = themeIcons[key as keyof typeof themeIcons] || Palette;
              const isSelected = currentThemeName === key;
              
              return (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? `${theme.cardBg} ${theme.border} border-2 ${theme.glowEffect}`
                      : `${currentTheme.surface} ${currentTheme.border} border hover:${currentTheme.surfaceHover}`
                  }`}
                  onClick={() => setTheme(key)}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${theme.buttonPrimary} flex items-center justify-center`}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`p-4 rounded-xl ${theme.surface} ${theme.neonAccent}`}>
                      <IconComponent className={`h-8 w-8 ${theme.text}`} />
                    </div>
                    
                    <div className="text-center">
                      <h3 className={`font-semibold ${isSelected ? theme.text : currentTheme.text} mb-2`}>
                        {theme.name}
                      </h3>
                      <p className={`text-sm ${isSelected ? theme.textMuted : currentTheme.textMuted} leading-relaxed`}>
                        {themeDescriptions[key as keyof typeof themeDescriptions]}
                      </p>
                    </div>

                    {/* Theme Preview */}
                    <div className="w-full space-y-2">
                      <div className={`h-3 rounded-full ${theme.bgPrimary}`}></div>
                      <div className="flex space-x-2">
                        <div className={`h-2 w-1/3 rounded ${theme.buttonPrimary.split(' ')[0]}`}></div>
                        <div className={`h-2 w-1/4 rounded ${theme.surface}`}></div>
                        <div className={`h-2 w-1/5 rounded ${theme.highlight}`}></div>
                      </div>
                      <div className={`h-2 w-2/3 rounded ${theme.surface}`}></div>
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`w-full px-3 py-2 rounded-lg ${theme.highlight} text-center`}
                      >
                        <span className={`text-sm font-medium ${theme.success}`}>
                          ✓ Currently Active
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className={`mt-8 p-6 rounded-xl ${currentTheme.highlight} ${currentTheme.border} border`}>
            <h3 className={`text-lg font-semibold ${currentTheme.text} mb-3`}>Theme Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>Glass morphism effects</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>Smooth animations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>Professional shadows</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>Responsive design</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>Accessibility optimized</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${currentTheme.success.replace('text-', 'bg-')}`}></div>
                <span className={`text-sm ${currentTheme.textMuted}`}>High contrast ratios</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;