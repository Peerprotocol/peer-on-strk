"use client";
import React, { createContext, useState, useContext } from 'react';

interface DarkModeContextProps {
    isDarkMode: boolean;
    toggleDark: () => void;
}

interface DarkModeProviderProps {
    children: React.ReactNode;
}

export const DarkModeContext = createContext<DarkModeContextProps>({
    isDarkMode: false,
    toggleDark: () => {}
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDark = () => {
    setIsDarkMode(!isDarkMode);
  };

  const darkModeContextValue = {
    isDarkMode,
    toggleDark,
  };

  return (
    <DarkModeContext.Provider value={darkModeContextValue}>
      {children}
    </DarkModeContext.Provider>
  );
};
