import type { Metadata } from "next";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import Provider from "../components/sessionProvider";
import "@mantine/core/styles.css";

export const metadata: Metadata = {
  title: "Pin-Map",
  description: "Pin any location!",
};

const theme = createTheme({
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  
  },
 
 primaryColor: 'cyan',
  fontFamily: 'Open Sans, sans-serif',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body>
        <Provider>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            {children}
          </MantineProvider>
        </Provider>
      </body>
    </html>
  );
}