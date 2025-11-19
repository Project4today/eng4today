import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'fancy';
  });

  useEffect(() => {
    // This is the correct logic: only add classes for non-default themes.
    document.body.className = ''; // Clear all classes first
    if (theme !== 'fancy') {
      document.body.classList.add(`${theme}-theme`);
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
