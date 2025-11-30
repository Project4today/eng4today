import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextDefinition';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('app-theme') || 'monochrome';
  });

  useEffect(() => {
    const bodyClasses = document.body.classList;
    // Remove all possible theme classes before adding the new one
    bodyClasses.remove('fancy-theme', 'dark-theme', 'light-theme', 'monochrome-theme');
    bodyClasses.add(`${theme}-theme`);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
