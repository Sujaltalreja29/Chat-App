// components/ThemeProvider.jsx
import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

const ThemeProvider = ({ children }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also add to body for better coverage
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;