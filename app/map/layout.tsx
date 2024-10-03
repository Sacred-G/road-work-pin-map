"use client"

import React from 'react';
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import Navbar from '../../components/navbar';
import Script from 'next/script';

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar/>
      <div>{children}</div>
    </>
  );
}
