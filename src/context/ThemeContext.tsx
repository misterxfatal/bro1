import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  text: string;
  accent: string;
  buttonPrimary: string;
  buttonSecondary: string;
  bgAnimation: string;
  gradient: string;
  cardBg: string;
  border: string;
  highlight: string;
  shadow: string;
};

const themes: Record<string, Theme> = {
  light: {
    name: 'Light',
    bgPrimary: 'bg-white',
    bgSecondary: 'bg-gray-50',
    text: 'text-gray-900',
    accent: 'blue',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md hover:shadow-lg transition-all duration-200',
    bgAnimation: 'light-bg',
    gradient: 'from-blue-500 to-blue-600',
    cardBg: 'bg-white',
    border: 'border-gray-200',
    highlight: 'bg-blue-50',
    shadow: 'shadow-lg hover:shadow-xl'
  },
  dark: {
    name: 'Dark',
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800',
    text: 'text-white',
    accent: 'purple',
    buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200',
    buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-200',
    bgAnimation: 'dark-bg',
    gradient: 'from-purple-500 to-purple-600',
    cardBg: 'bg-gray-800',
    border: 'border-gray-700',
    highlight: 'bg-purple-900',
    shadow: 'shadow-lg hover:shadow-xl'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    bgPrimary: 'bg-black',
    bgSecondary: 'bg-gray-900',
    text: 'text-green-400',
    accent: 'green',
    buttonPrimary: 'bg-green-500 hover:bg-green-600 text-black shadow-lg hover:shadow-xl transition-all duration-200',
    buttonSecondary: 'bg-gray-800 hover:bg-gray-700 text-green-400 shadow-md hover:shadow-lg transition-all duration-200',
    bgAnimation: 'cyber-bg',
    gradient: 'from-green-400 to-green-500',
    cardBg: 'bg-gray-900',
    border: 'border-green-500',
    highlight: 'bg-green-900',
    shadow: 'shadow-lg hover:shadow-xl shadow-green-500/20'
  }
};

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: typeof themes;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.light,
  setTheme: () => {},
  availableThemes: themes
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
    }
  }, []);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      localStorage.setItem('theme', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};