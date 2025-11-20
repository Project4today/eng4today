import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextDefinition';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('app-theme') || 'fancy';
  });

  useEffect(() => {
    const bodyClasses = document.body.classList;
    // This is the only logic needed. CSS variables handle the rest.
    bodyClasses.remove('fancy-theme', 'dark-theme', 'light-theme');
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
