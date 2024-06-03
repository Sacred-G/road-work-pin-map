'use client'

import React, { useState } from 'react';
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "../../styles/globals.css";
import Navbar from "../../components/navbar";
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface NavbarProps {
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  // Include other existing props here
}
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [viewState, setViewState] = useState<{
    longitude: number;
    latitude: number;
    zoom: number;
  }>({
    longitude: 0,
    latitude: 0,
    zoom: 10
  });

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <Navbar />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
