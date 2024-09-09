import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { ColorScheme } from '../types/colorscheme';

export function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  // Ensure only 'light' or 'dark' is passed to forceColorScheme
  const forcedColorScheme = colorScheme === 'auto' ? 'light' : colorScheme;

  return (
    <MantineProvider
      theme={{
        colors: {
          dark: [
            '#d5d7e0',
            '#acaebf',
            '#8c8fa3',
            '#666980',
            '#4d4f66',
            '#34354a',
            '#2b2c3d',
            '#34354a',  
            '#34354a',
            '#34354a',
          ],
        },
      }}
      forceColorScheme={forcedColorScheme}
    >
      {children}
    </MantineProvider>
  );
}