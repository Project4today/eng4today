import React, { useState } from 'react';
import { useTheme } from './contexts/useTheme'; // Corrected import path
import Button from './components/ui/Button';

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const ThemeMenu = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="theme-menu">
            <div className="theme-menu-title">Change Theme</div>
            <Button variant="secondary" className={currentTheme === 'fancy' ? 'active' : ''} onClick={() => onThemeChange('fancy')}>Fancy Mode</Button>
            <Button variant="secondary" className={currentTheme === 'dark' ? 'active' : ''} onClick={() => onThemeChange('dark')}>Dark Mode</Button>
            <Button variant="secondary" className={currentTheme === 'light' ? 'active' : ''} onClick={() => onThemeChange('light')}>Light Mode</Button>
        </div>
    );
};

const Header = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { theme, changeTheme } = useTheme();

    const handleThemeChange = (newTheme) => {
        changeTheme(newTheme);
        setShowMenu(false);
    };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Future: Logo or App Name */}
      </div>
      <div className="header-right">
        <div className="settings-menu-container">
            <Button variant="icon" onClick={() => setShowMenu(!showMenu)}>
              <SettingsIcon />
            </Button>
            {showMenu && <ThemeMenu currentTheme={theme} onThemeChange={handleThemeChange} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
