import { useState, useEffect } from 'react';
import { lighten, MantineProvider, MantineColorSchemeManager } from '@mantine/core';
import { ColorScheme } from '../types/colorscheme';

export function ColorSchemeWrapper({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const systemColorScheme =(null as unknown) as ColorScheme;

  useEffect(() => {
    if (colorScheme === 'auto') {
      setColorScheme(systemColorScheme);
    }
  }, [colorScheme, systemColorScheme]);

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

 

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
     
    >
      {children}
    </MantineProvider>
  );
}