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
    bgSecondary: 'bg-white/90 backdrop-blur-xl',
    text: 'text-slate-900',
    accent: 'slate',
    buttonPrimary: 'bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white shadow-professional hover:shadow-professional-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    buttonSecondary: 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300/50 shadow-professional hover:shadow-professional-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-slate-900 via-slate-800 to-slate-700',
    cardBg: 'bg-white/80 backdrop-blur-xl border border-white/20',
    border: 'border-slate-200/50',
    highlight: 'bg-slate-50/80 backdrop-blur-sm',
    shadow: 'shadow-professional hover:shadow-professional-xl',
    textMuted: 'text-slate-500',
    textCaption: 'text-slate-600',
    surface: 'bg-slate-100/60 backdrop-blur-sm',
    surfaceHover: 'hover:bg-slate-200/60',
    divider: 'border-slate-200/30',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    glowEffect: 'shadow-glow',
    neonAccent: 'shadow-slate-500/20',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.15)_1px,_transparent_0)] bg-[size:20px_20px]'
  },
  dark: {
    name: 'Professional Dark',
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
    bgSecondary: 'bg-slate-900/90 backdrop-blur-xl',
    text: 'text-white',
    accent: 'slate',
    buttonPrimary: 'bg-gradient-to-r from-white to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-900 shadow-professional hover:shadow-professional-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    buttonSecondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-600/50 shadow-professional hover:shadow-professional-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-white via-slate-100 to-slate-200',
    cardBg: 'bg-slate-800/80 backdrop-blur-xl border border-slate-700/30',
    border: 'border-slate-700/50',
    highlight: 'bg-slate-700/60 backdrop-blur-sm',
    shadow: 'shadow-professional-lg hover:shadow-professional-xl',
    textMuted: 'text-slate-400',
    textCaption: 'text-slate-300',
    surface: 'bg-slate-700/60 backdrop-blur-sm',
    surfaceHover: 'hover:bg-slate-600/60',
    divider: 'border-slate-700/30',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
    glowEffect: 'shadow-glow',
    neonAccent: 'shadow-white/10',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:20px_20px]'
  },
  cyber: {
    name: 'Cyberpunk Matrix',
    bgPrimary: 'bg-gradient-to-br from-black via-gray-900 to-green-950',
    bgSecondary: 'bg-black/90 backdrop-blur-xl',
    text: 'text-green-400',
    accent: 'green',
    buttonPrimary: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-mono font-bold',
    buttonSecondary: 'bg-black/80 hover:bg-green-950/80 text-green-400 border border-green-500/50 shadow-glow hover:shadow-glow-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-mono',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    cardBg: 'bg-black/80 backdrop-blur-xl border border-green-500/30 shadow-glow',
    border: 'border-green-500/50',
    highlight: 'bg-green-950/60 backdrop-blur-sm border border-green-500/20',
    shadow: 'shadow-glow hover:shadow-glow-lg',
    textMuted: 'text-green-300',
    textCaption: 'text-green-200',
    surface: 'bg-green-950/40 backdrop-blur-sm border border-green-500/20',
    surfaceHover: 'hover:bg-green-900/40',
    divider: 'border-green-500/30',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-glow',
    neonAccent: 'shadow-green-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.2)_1px,_transparent_0)] bg-[size:15px_15px]'
  },
  gaming: {
    name: 'Gaming RGB',
    bgPrimary: 'bg-gradient-to-br from-purple-950 via-blue-950 to-pink-950',
    bgSecondary: 'bg-slate-900/90 backdrop-blur-xl',
    text: 'text-white',
    accent: 'purple',
    buttonPrimary: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-bold animate-gradient-x',
    buttonSecondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 border border-purple-500/50 shadow-glow hover:shadow-glow-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-purple-600 via-pink-600 to-blue-600',
    cardBg: 'bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 shadow-glow',
    border: 'border-purple-500/50',
    highlight: 'bg-purple-950/60 backdrop-blur-sm border border-purple-500/20',
    shadow: 'shadow-glow hover:shadow-glow-lg',
    textMuted: 'text-purple-300',
    textCaption: 'text-purple-200',
    surface: 'bg-purple-950/40 backdrop-blur-sm border border-purple-500/20',
    surfaceHover: 'hover:bg-purple-900/40',
    divider: 'border-purple-500/30',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-glow',
    neonAccent: 'shadow-purple-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(147,51,234,0.2)_1px,_transparent_0)] bg-[size:12px_12px]'
  },
  neon: {
    name: 'Neon Synthwave',
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950',
    bgSecondary: 'bg-black/90 backdrop-blur-xl',
    text: 'text-pink-300',
    accent: 'pink',
    buttonPrimary: 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-bold',
    buttonSecondary: 'bg-black/80 hover:bg-pink-950/80 text-pink-300 border border-pink-500/50 shadow-glow hover:shadow-glow-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
    cardBg: 'bg-black/80 backdrop-blur-xl border border-pink-500/30 shadow-glow',
    border: 'border-pink-500/50',
    highlight: 'bg-pink-950/60 backdrop-blur-sm border border-pink-500/20',
    shadow: 'shadow-glow hover:shadow-glow-lg',
    textMuted: 'text-pink-200',
    textCaption: 'text-pink-100',
    surface: 'bg-pink-950/40 backdrop-blur-sm border border-pink-500/20',
    surfaceHover: 'hover:bg-pink-900/40',
    divider: 'border-pink-500/30',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-glow',
    neonAccent: 'shadow-pink-500/50',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(236,72,153,0.2)_1px,_transparent_0)] bg-[size:10px_10px]'
  },
  ocean: {
    name: 'Ocean Depths',
    bgPrimary: 'bg-gradient-to-br from-blue-950 via-teal-950 to-cyan-950',
    bgSecondary: 'bg-blue-900/90 backdrop-blur-xl',
    text: 'text-cyan-100',
    accent: 'cyan',
    buttonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow hover:shadow-glow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    buttonSecondary: 'bg-blue-900/80 hover:bg-blue-800/80 text-cyan-300 border border-cyan-500/50 shadow-glow hover:shadow-glow-lg backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-medium',
    bgAnimation: 'animate-gradient-y',
    gradient: 'from-cyan-500 via-blue-500 to-teal-600',
    cardBg: 'bg-blue-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-glow',
    border: 'border-cyan-500/50',
    highlight: 'bg-cyan-950/60 backdrop-blur-sm border border-cyan-500/20',
    shadow: 'shadow-glow hover:shadow-glow-lg',
    textMuted: 'text-cyan-300',
    textCaption: 'text-cyan-200',
    surface: 'bg-cyan-950/40 backdrop-blur-sm border border-cyan-500/20',
    surfaceHover: 'hover:bg-cyan-900/40',
    divider: 'border-cyan-500/30',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-glow',
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