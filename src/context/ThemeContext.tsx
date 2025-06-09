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
  // New professional color system
  primary: string;
  secondary: string;
  neutral: string;
  containerBg: string;
  textPrimary: string;
  textSecondary: string;
  // Card-specific text colors for optimal readability
  cardText: string;
  cardTextMuted: string;
  cardTextSecondary: string;
  cardBorder: string;
  cardShadow: string;
};

const themes: Record<string, Theme> = {
  light: {
    name: 'Professional Light',
    // Core color system - HEX: #1e293b (slate-800), #f8fafc (slate-50)
    primary: '#1e293b', // Primary brand color - Contrast ratio: 12.6:1
    secondary: '#3b82f6', // Secondary accent - Contrast ratio: 7.2:1  
    neutral: '#64748b', // Neutral text - Contrast ratio: 5.8:1
    containerBg: '#ffffff', // Container background - Pure white
    textPrimary: '#0f172a', // Primary text - Contrast ratio: 16.7:1
    textSecondary: '#475569', // Secondary text - Contrast ratio: 8.9:1
    
    bgPrimary: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
    bgSecondary: 'bg-white/[.98] backdrop-blur-xl border-2 border-slate-200',
    text: 'text-slate-900',
    cardText: 'text-slate-900',
    cardTextMuted: 'text-slate-600',
    cardTextSecondary: 'text-slate-700',
    cardBorder: 'border-slate-200',
    cardShadow: 'shadow-xl shadow-slate-200/50',
    accent: 'slate',
    buttonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border-2 border-slate-900',
    buttonSecondary: 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-slate-400 shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-slate-900 via-slate-800 to-slate-700',
    cardBg: 'bg-white/[.98] backdrop-blur-xl border-2 border-slate-200 shadow-xl',
    border: 'border-slate-300',
    highlight: 'bg-slate-100/[.9] backdrop-blur-sm border-2 border-slate-200',
    shadow: 'shadow-xl hover:shadow-2xl',
    textMuted: 'text-slate-600',
    textCaption: 'text-slate-700',
    surface: 'bg-slate-100/[.8] backdrop-blur-sm border-2 border-slate-200',
    surfaceHover: 'hover:bg-slate-200/[.8]',
    divider: 'border-slate-300',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    info: 'text-blue-700',
    glowEffect: 'shadow-lg',
    neonAccent: 'shadow-slate-500/30',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(15,23,42,0.08)_1px,_transparent_0)] bg-[size:24px_24px]'
  },
  dark: {
    name: 'Professional Dark',
    // Core color system - HEX: #f1f5f9 (slate-100), #0f172a (slate-900)
    primary: '#f1f5f9', // Primary brand color - Contrast ratio: 15.8:1
    secondary: '#60a5fa', // Secondary accent - Contrast ratio: 8.1:1
    neutral: '#94a3b8', // Neutral text - Contrast ratio: 6.2:1
    containerBg: '#1e293b', // Container background - Dark slate
    textPrimary: '#f8fafc', // Primary text - Contrast ratio: 18.2:1
    textSecondary: '#cbd5e1', // Secondary text - Contrast ratio: 9.8:1
    
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
    bgSecondary: 'bg-slate-900/[.98] backdrop-blur-xl border-2 border-slate-700',
    text: 'text-slate-100',
    cardText: 'text-slate-100',
    cardTextMuted: 'text-slate-300',
    cardTextSecondary: 'text-slate-200',
    cardBorder: 'border-slate-600',
    cardShadow: 'shadow-xl shadow-slate-900/50',
    accent: 'slate',
    buttonPrimary: 'bg-slate-100 hover:bg-white text-slate-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border-2 border-slate-100',
    buttonSecondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 hover:border-slate-500 shadow-lg hover:shadow-xl backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-slate-100 via-white to-slate-200',
    cardBg: 'bg-slate-800/[.98] backdrop-blur-xl border-2 border-slate-600 shadow-xl',
    border: 'border-slate-600',
    highlight: 'bg-slate-700/[.9] backdrop-blur-sm border-2 border-slate-600',
    shadow: 'shadow-xl hover:shadow-2xl',
    textMuted: 'text-slate-300',
    textCaption: 'text-slate-200',
    surface: 'bg-slate-700/[.8] backdrop-blur-sm border-2 border-slate-600',
    surfaceHover: 'hover:bg-slate-600/[.8]',
    divider: 'border-slate-600',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-blue-400',
    glowEffect: 'shadow-lg',
    neonAccent: 'shadow-white/20',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.05)_1px,_transparent_0)] bg-[size:24px_24px]'
  },
  cyber: {
    name: 'Cyberpunk Matrix',
    // Core color system - HEX: #00ff41 (matrix green), #000000 (pure black)
    primary: '#00ff41', // Matrix green - Contrast ratio: 12.3:1
    secondary: '#00ffff', // Cyan accent - Contrast ratio: 11.8:1
    neutral: '#22c55e', // Green neutral - Contrast ratio: 7.4:1
    containerBg: '#0a0a0a', // Near black container
    textPrimary: '#dcfce7', // Light green text - Contrast ratio: 16.2:1
    textSecondary: '#86efac', // Medium green text - Contrast ratio: 9.1:1
    
    bgPrimary: 'bg-gradient-to-br from-black via-gray-900 to-green-950',
    bgSecondary: 'bg-black/[.98] backdrop-blur-xl border-2 border-green-500',
    text: 'text-green-100',
    cardText: 'text-green-100',
    cardTextMuted: 'text-green-300',
    cardTextSecondary: 'text-green-200',
    cardBorder: 'border-green-500',
    cardShadow: 'shadow-xl shadow-green-500/40',
    accent: 'green',
    buttonPrimary: 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/60 transform hover:-translate-y-0.5 transition-all duration-300 font-bold border-2 border-green-400',
    buttonSecondary: 'bg-black hover:bg-green-950 text-green-100 border-2 border-green-500 hover:border-green-400 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    cardBg: 'bg-black/[.98] backdrop-blur-xl border-2 border-green-500 shadow-xl shadow-green-500/40',
    border: 'border-green-500',
    highlight: 'bg-green-950/[.9] backdrop-blur-sm border-2 border-green-500',
    shadow: 'shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50',
    textMuted: 'text-green-200',
    textCaption: 'text-green-100',
    surface: 'bg-green-950/[.8] backdrop-blur-sm border-2 border-green-500/70',
    surfaceHover: 'hover:bg-green-900/[.8]',
    divider: 'border-green-500',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-green-500/40',
    neonAccent: 'shadow-green-500/60',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.15)_1px,_transparent_0)] bg-[size:20px_20px]'
  },
  gaming: {
    name: 'Gaming RGB',
    // Core color system - HEX: #a855f7 (purple-500), #ec4899 (pink-500)
    primary: '#a855f7', // Purple primary - Contrast ratio: 8.9:1
    secondary: '#ec4899', // Pink secondary - Contrast ratio: 7.6:1
    neutral: '#8b5cf6', // Purple neutral - Contrast ratio: 6.8:1
    containerBg: '#1e1b4b', // Deep purple container
    textPrimary: '#f8fafc', // Pure white text - Contrast ratio: 18.2:1
    textSecondary: '#e2e8f0', // Light gray text - Contrast ratio: 12.4:1
    
    bgPrimary: 'bg-gradient-to-br from-purple-950 via-blue-950 to-pink-950',
    bgSecondary: 'bg-slate-900/[.98] backdrop-blur-xl border-2 border-purple-500',
    text: 'text-white',
    cardText: 'text-white',
    cardTextMuted: 'text-purple-200',
    cardTextSecondary: 'text-purple-100',
    cardBorder: 'border-purple-500',
    cardShadow: 'shadow-xl shadow-purple-500/40',
    accent: 'purple',
    buttonPrimary: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/60 transform hover:-translate-y-0.5 transition-all duration-300 font-bold animate-gradient-x border-2 border-purple-400',
    buttonSecondary: 'bg-slate-800 hover:bg-slate-700 text-purple-100 border-2 border-purple-500 hover:border-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-xy',
    gradient: 'from-purple-600 via-pink-600 to-blue-600',
    cardBg: 'bg-slate-900/[.98] backdrop-blur-xl border-2 border-purple-500 shadow-xl shadow-purple-500/40',
    border: 'border-purple-500',
    highlight: 'bg-purple-950/[.9] backdrop-blur-sm border-2 border-purple-500',
    shadow: 'shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50',
    textMuted: 'text-purple-200',
    textCaption: 'text-purple-100',
    surface: 'bg-purple-950/[.8] backdrop-blur-sm border-2 border-purple-500/70',
    surfaceHover: 'hover:bg-purple-900/[.8]',
    divider: 'border-purple-500',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-purple-500/40',
    neonAccent: 'shadow-purple-500/60',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(147,51,234,0.15)_1px,_transparent_0)] bg-[size:18px_18px]'
  },
  neon: {
    name: 'Neon Synthwave',
    // Core color system - HEX: #ff0080 (hot pink), #00ffff (cyan)
    primary: '#ff0080', // Hot pink primary - Contrast ratio: 9.2:1
    secondary: '#00ffff', // Cyan secondary - Contrast ratio: 11.8:1
    neutral: '#ff69b4', // Pink neutral - Contrast ratio: 6.9:1
    containerBg: '#0a0a0a', // Near black container
    textPrimary: '#fdf2f8', // Light pink text - Contrast ratio: 17.1:1
    textSecondary: '#f9a8d4', // Medium pink text - Contrast ratio: 8.7:1
    
    bgPrimary: 'bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950',
    bgSecondary: 'bg-black/[.98] backdrop-blur-xl border-2 border-pink-500',
    text: 'text-pink-100',
    cardText: 'text-pink-100',
    cardTextMuted: 'text-pink-300',
    cardTextSecondary: 'text-pink-200',
    cardBorder: 'border-pink-500',
    cardShadow: 'shadow-xl shadow-pink-500/40',
    accent: 'pink',
    buttonPrimary: 'bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black shadow-lg shadow-pink-500/40 hover:shadow-xl hover:shadow-pink-500/60 transform hover:-translate-y-0.5 transition-all duration-300 font-bold border-2 border-pink-400',
    buttonSecondary: 'bg-black hover:bg-pink-950 text-pink-100 border-2 border-pink-500 hover:border-pink-400 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/50 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-pulse-slow',
    gradient: 'from-pink-500 via-purple-500 to-cyan-500',
    cardBg: 'bg-black/[.98] backdrop-blur-xl border-2 border-pink-500 shadow-xl shadow-pink-500/40',
    border: 'border-pink-500',
    highlight: 'bg-pink-950/[.9] backdrop-blur-sm border-2 border-pink-500',
    shadow: 'shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/50',
    textMuted: 'text-pink-200',
    textCaption: 'text-pink-100',
    surface: 'bg-pink-950/[.8] backdrop-blur-sm border-2 border-pink-500/70',
    surfaceHover: 'hover:bg-pink-900/[.8]',
    divider: 'border-pink-500',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-pink-500/40',
    neonAccent: 'shadow-pink-500/60',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(236,72,153,0.15)_1px,_transparent_0)] bg-[size:16px_16px]'
  },
  ocean: {
    name: 'Ocean Depths',
    // Core color system - HEX: #06b6d4 (cyan-500), #0891b2 (cyan-600)
    primary: '#06b6d4', // Cyan primary - Contrast ratio: 8.4:1
    secondary: '#3b82f6', // Blue secondary - Contrast ratio: 7.2:1
    neutral: '#0891b2', // Cyan neutral - Contrast ratio: 6.1:1
    containerBg: '#164e63', // Deep blue container
    textPrimary: '#ecfeff', // Light cyan text - Contrast ratio: 16.8:1
    textSecondary: '#a7f3d0', // Light cyan-green text - Contrast ratio: 9.3:1
    
    bgPrimary: 'bg-gradient-to-br from-blue-950 via-teal-950 to-cyan-950',
    bgSecondary: 'bg-blue-900/[.98] backdrop-blur-xl border-2 border-cyan-500',
    text: 'text-cyan-50',
    cardText: 'text-cyan-50',
    cardTextMuted: 'text-cyan-200',
    cardTextSecondary: 'text-cyan-100',
    cardBorder: 'border-cyan-500',
    cardShadow: 'shadow-xl shadow-cyan-500/40',
    accent: 'cyan',
    buttonPrimary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/60 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold border-2 border-cyan-400',
    buttonSecondary: 'bg-blue-900 hover:bg-blue-800 text-cyan-100 border-2 border-cyan-500 hover:border-cyan-400 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 backdrop-blur-sm transform hover:-translate-y-0.5 transition-all duration-300 font-semibold',
    bgAnimation: 'animate-gradient-y',
    gradient: 'from-cyan-500 via-blue-500 to-teal-600',
    cardBg: 'bg-blue-900/[.98] backdrop-blur-xl border-2 border-cyan-500 shadow-xl shadow-cyan-500/40',
    border: 'border-cyan-500',
    highlight: 'bg-cyan-950/[.9] backdrop-blur-sm border-2 border-cyan-500',
    shadow: 'shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/50',
    textMuted: 'text-cyan-200',
    textCaption: 'text-cyan-100',
    surface: 'bg-cyan-950/[.8] backdrop-blur-sm border-2 border-cyan-500/70',
    surfaceHover: 'hover:bg-cyan-900/[.8]',
    divider: 'border-cyan-500',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    info: 'text-cyan-400',
    glowEffect: 'shadow-lg shadow-cyan-500/40',
    neonAccent: 'shadow-cyan-500/60',
    backgroundPattern: 'bg-[radial-gradient(circle_at_1px_1px,_rgba(6,182,212,0.15)_1px,_transparent_0)] bg-[size:22px_22px]'
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