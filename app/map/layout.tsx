'use client'

import { useState, useEffect } from "react";
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import Navbar from "../../components/navbar";
import { ColorScheme } from "../../types/colorscheme";

const theme = createTheme({
  // You can add custom theme settings here if needed
});

export default function MapLayout({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedColorScheme = localStorage.getItem('mantine-color-scheme') as ColorScheme | null;
    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
    }
  }, []);

  const toggleColorScheme = (value?: ColorScheme) => {
    const newColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(newColorScheme);
    localStorage.setItem('mantine-color-scheme', newColorScheme);
  };

  if (!mounted) {
    return null; // or a loading placeholder
  }

  return (
    <MantineProvider 
      theme={theme}
      defaultColorScheme={colorScheme}
      // withGlobalStyles 
      // withNormalizeCSS
    >
      <ColorSchemeScript />
      <Navbar toggleColorScheme={toggleColorScheme} />
      {children}
    </MantineProvider>
  );
}