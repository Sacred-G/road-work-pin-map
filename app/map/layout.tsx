"use client"

import React, { useState } from 'react';
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "../../styles/globals.css"; // Ensure this path is correct
import Navbar from "../../components/navbar";
import Head from 'next/head';



export default function RootLayout({ children }: { children: React.ReactNode }) {
 

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>My App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
      </Head>
      <MantineProvider>
        <Navbar/>
        <div>{children}</div>
      </MantineProvider>
    </>
  );
}
