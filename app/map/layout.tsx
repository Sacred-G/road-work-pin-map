'use client';

import { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import '../../styles/globals.css'; // Ensure this path is correct
import {  createTheme, ColorSchemeScript, MantineProvider } from '@mantine/core';
import Navbar from '../../components/navbar'; // Ensure the path is correct
import '@mantine/dates/styles.css';


const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<{ addressA: string; addressB: string } | null>(null);

  const handleSetRoute = (addressA: string, addressB: string) => {
    setRoute({ addressA, addressB });
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const script = document.createElement('script');
      script.src = 'http://localhost:8097';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <title>Pin Map</title>
        <meta name="viewport" content="width=devsudo ice-width, initial-scale=1" />
      </head>
      <body>
      <MantineProvider theme={theme}>
          <Navbar setRoute={handleSetRoute} />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

