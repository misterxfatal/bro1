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
  textMuted: string;
  textCaption: string;
  surface: string;
  surfaceHover: string;
  divider: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

const themes: Record<string, Theme> = {
  light: {
    name: 'Professional Light',
    bgPrimary: 'bg-slate-50',
    bgSecondary: 'bg-white',
    text: 'text-slate-900',
    accent: 'slate',
    buttonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    buttonSecondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    bgAnimation: 'light-bg',
    gradient: 'from-slate-900 to-slate-700',
    cardBg: 'bg-white',
    border: 'border-slate-200',
    highlight: 'bg-slate-50',
    shadow: 'shadow-professional hover:shadow-professional-lg',
    textMuted: 'text-slate-500',
    textCaption: 'text-slate-600',
    surface: 'bg-slate-100',
    surfaceHover: 'hover:bg-slate-200',
    divider: 'border-slate-200',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  },
  dark: {
    name: 'Professional Dark',
    bgPrimary: 'bg-slate-900',
    bgSecondary: 'bg-slate-800',
    text: 'text-white',
    accent: 'slate',
    buttonPrimary: 'bg-white hover:bg-slate-100 text-slate-900 shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    bgAnimation: 'dark-bg',
    gradient: 'from-slate-100 to-white',
    cardBg: 'bg-slate-800',
    border: 'border-slate-700',
    highlight: 'bg-slate-700',
    shadow: 'shadow-professional-lg hover:shadow-professional-xl',
    textMuted: 'text-slate-400',
    textCaption: 'text-slate-300',
    surface: 'bg-slate-700',
    surfaceHover: 'hover:bg-slate-600',
    divider: 'border-slate-700',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-blue-400'
  },
  modern: {
    name: 'Modern Blue',
    bgPrimary: 'bg-blue-50',
    bgSecondary: 'bg-white',
    text: 'text-slate-900',
    accent: 'blue',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    buttonSecondary: 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 shadow-professional hover:shadow-professional-lg transition-all duration-200 font-medium',
    bgAnimation: 'modern-bg',
    gradient: 'from-blue-600 to-blue-700',
    cardBg: 'bg-white',
    border: 'border-blue-200',
    highlight: 'bg-blue-50',
    shadow: 'shadow-professional hover:shadow-professional-lg',
    textMuted: 'text-slate-500',
    textCaption: 'text-slate-600',
    surface: 'bg-blue-100',
    surfaceHover: 'hover:bg-blue-200',
    divider: 'border-blue-200',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  }
};

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: typeof themes;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.light,
  setTheme: () => {},
  availableThemes: themes,
  isDark: false
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      setIsDark(themeName === 'dark');
      localStorage.setItem('theme', themeName);
      
      // Update document class for dark mode
      if (themeName === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};