'use client';

import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeProviderContext = React.createContext<ThemeProviderContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'onesam-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = React.useState(false);

  // Get the resolved theme based on system preference
  const getResolvedTheme = React.useCallback((theme: Theme): 'light' | 'dark' => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return theme;
  }, []);

  // Initialize theme from localStorage
  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    setMounted(true);
  }, [storageKey]);

  // Update resolved theme and apply to document
  React.useEffect(() => {
    if (!mounted) return;

    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [theme, mounted, getResolvedTheme]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getResolvedTheme('system');
      setResolvedTheme(resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getResolvedTheme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider value={{ theme: defaultTheme, setTheme, resolvedTheme: 'light' }}>
        {children}
      </ThemeProviderContext.Provider>
    );
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
