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
  glowEffect: string;
  neonAccent: string;
  backgroundPattern: string;
};

const themes: Record<string, Theme> = {
  light: {
    name: 'Professional Light',
    bgPrimary: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
    bgSecondary: 'bg-white/95 backdrop-blur-xl border border-slate-200/60',
    text: 'text-slate-900',
    accent: 'slate',
    buttonPrimary: 'bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border border-slate-800',
    buttonSecondary: 'bg-white/90 hover:bg-white text-slate-800 border-2 border-slate-300 hover:border-slate-400 shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-slate-900 via-slate-800 to-slate-700',
    cardBg: 'bg-white/90 backdrop-blur-xl border-2 border-slate-200/70 shadow-xl',
    border: 'border-slate-300/70',
    highlight: 'bg-slate-100/80 backdrop-blur-sm border border-slate-200/50',
    shadow: 'shadow-xl hover:shadow-2xl',
    textMuted: 'text-slate-600',
    textCaption: 'text-slate-700',
    surface: 'bg-slate-100/70 backdrop-blur-sm border border-slate-200/40',
    surfaceHover: 'hover:bg-slate-200/70',
    divider: 'border-slate-300/50',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
    glowEffect: 'shadow-lg',
    neonAccent: 'shadow-slate-500/30',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.15)_1px,_transparent_0)] bg-[size:20px_20px]'
  },
  dark: {
    name: 'Professional Dark',
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
    bgSecondary: 'bg-slate-900/95 backdrop-blur-xl border border-slate-700/60',
    text: 'text-white',
    accent: 'slate',
    buttonPrimary: 'bg-gradient-to-r from-white to-slate-100 hover:from-slate-50 hover:to-slate-200 text-slate-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border border-white',
    buttonSecondary: 'bg-slate-800/90 hover:bg-slate-700/90 text-white border-2 border-slate-600 hover:border-slate-500 shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-white via-slate-100 to-slate-200',
    cardBg: 'bg-slate-800/90 backdrop-blur-xl border-2 border-slate-700/60 shadow-xl',
    border: 'border-slate-600/70',
    highlight: 'bg-slate-700/70 backdrop-blur-sm border border-slate-600/50',
    shadow: 'shadow-xl hover:shadow-2xl',
    textMuted: 'text-slate-300',
    textCaption: 'text-slate-200',
    surface: 'bg-slate-700/70 backdrop-blur-sm border border-slate-600/40',
    surfaceHover: 'hover:bg-slate-600/70',
    divider: 'border-slate-600/50',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
    glowEffect: 'shadow-lg',
    neonAccent: 'shadow-white/20',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.1)_1px,_transparent_0)] bg-[size:20px_20px]'
  },
  cyber: {
    name: 'Cyberpunk Matrix',
    bgPrimary: 'bg-gradient-to-br from-black via-gray-900 to-green-950',
    bgSecondary: 'bg-black/95 backdrop-blur-xl border border-green-500/40',
    text: 'text-green-100',
    accent: 'green',
    buttonPrimary: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-bold border-2 border-green-400',
    buttonSecondary: 'bg-black/90 hover:bg-green-950/90 text-green-100 border-2 border-green-500 hover:border-green-400 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    cardBg: 'bg-black/90 backdrop-blur-xl border-2 border-green-500/50 shadow-xl shadow-green-500/20',
    border: 'border-green-500/60',
    highlight: 'bg-green-950/80 backdrop-blur-sm border border-green-500/40',
    shadow: 'shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30',
    textMuted: 'text-green-200',
    textCaption: 'text-green-100',
    surface: 'bg-green-950/60 backdrop-blur-sm border border-green-500/30',
    surfaceHover: 'hover:bg-green-900/60',
    divider: 'border-green-500/40',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-green-500/30',
    neonAccent: 'shadow-green-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.2)_1px,_transparent_0)] bg-[size:15px_15px]'
  },
  gaming: {
    name: 'Gaming RGB',
    bgPrimary: 'bg-gradient-to-br from-purple-950 via-blue-950 to-pink-950',
    bgSecondary: 'bg-slate-900/95 backdrop-blur-xl border border-purple-500/40',
    text: 'text-white',
    accent: 'purple',
    buttonPrimary: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-bold animate-gradient-x border-2 border-purple-400',
    buttonSecondary: 'bg-slate-800/90 hover:bg-slate-700/90 text-purple-100 border-2 border-purple-500 hover:border-purple-400 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-purple-600 via-pink-600 to-blue-600',
    cardBg: 'bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 shadow-xl shadow-purple-500/20',
    border: 'border-purple-500/60',
    highlight: 'bg-purple-950/80 backdrop-blur-sm border border-purple-500/40',
    shadow: 'shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30',
    textMuted: 'text-purple-200',
    textCaption: 'text-purple-100',
    surface: 'bg-purple-950/60 backdrop-blur-sm border border-purple-500/30',
    surfaceHover: 'hover:bg-purple-900/60',
    divider: 'border-purple-500/40',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-purple-500/30',
    neonAccent: 'shadow-purple-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(147,51,234,0.2)_1px,_transparent_0)] bg-[size:12px_12px]'
  },
  neon: {
    name: 'Neon Synthwave',
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950',
    bgSecondary: 'bg-black/95 backdrop-blur-xl border border-pink-500/40',
    text: 'text-pink-100',
    accent: 'pink',
    buttonPrimary: 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-bold border-2 border-pink-400',
    buttonSecondary: 'bg-black/90 hover:bg-pink-950/90 text-pink-100 border-2 border-pink-500 hover:border-pink-400 shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
    cardBg: 'bg-black/90 backdrop-blur-xl border-2 border-pink-500/50 shadow-xl shadow-pink-500/20',
    border: 'border-pink-500/60',
    highlight: 'bg-pink-950/80 backdrop-blur-sm border border-pink-500/40',
    shadow: 'shadow-xl shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/30',
    textMuted: 'text-pink-200',
    textCaption: 'text-pink-100',
    surface: 'bg-pink-950/60 backdrop-blur-sm border border-pink-500/30',
    surfaceHover: 'hover:bg-pink-900/60',
    divider: 'border-pink-500/40',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-pink-500/30',
    neonAccent: 'shadow-pink-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(236,72,153,0.2)_1px,_transparent_0)] bg-[size:10px_10px]'
  },
  ocean: {
    name: 'Ocean Depths',
    bgPrimary: 'bg-gradient-to-br from-blue-950 via-teal-950 to-cyan-950',
    bgSecondary: 'bg-blue-900/95 backdrop-blur-xl border border-cyan-500/40',
    text: 'text-cyan-50',
    accent: 'cyan',
    buttonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border-2 border-cyan-400',
    buttonSecondary: 'bg-blue-900/90 hover:bg-blue-800/90 text-cyan-100 border-2 border-cyan-500 hover:border-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-y',
    gradient: 'from-cyan-500 via-blue-500 to-teal-600',
    cardBg: 'bg-blue-900/90 backdrop-blur-xl border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20',
    border: 'border-cyan-500/60',
    highlight: 'bg-cyan-950/80 backdrop-blur-sm border border-cyan-500/40',
    shadow: 'shadow-xl shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30',
    textMuted: 'text-cyan-200',
    textCaption: 'text-cyan-100',
    surface: 'bg-cyan-950/60 backdrop-blur-sm border border-cyan-500/30',
    surfaceHover: 'hover:bg-cyan-900/60',
    divider: 'border-cyan-500/40',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-cyan-500/30',
    neonAccent: 'shadow-cyan-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(6,182,212,0.2)_1px,_transparent_0)] bg-[size:18px_18px]'
  }
};

type ThemeContextType = {
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: typeof themes;
  isDark: boolean;
  currentThemeName: string;
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes.light,
  setTheme: () => {},
  availableThemes: themes,
  isDark: false,
  currentThemeName: 'light'
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.light);
  const [isDark, setIsDark] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
      setCurrentThemeName(savedTheme);
      setIsDark(['dark', 'cyber', 'gaming', 'neon', 'ocean'].includes(savedTheme));
    }
  }, []);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      setCurrentThemeName(themeName);
      setIsDark(['dark', 'cyber', 'gaming', 'neon', 'ocean'].includes(themeName));
      localStorage.setItem('theme', themeName);
      
      // Update document class for dark mode
      if (['dark', 'cyber', 'gaming', 'neon', 'ocean'].includes(themeName)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes, isDark, currentThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};