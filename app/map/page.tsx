'use client'

import dynamic from 'next/dynamic'
import { Box, Skeleton } from "@mantine/core";
import { Suspense } from "react";

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import("../../components/mapComponent"), { 
  ssr: false,
  loading: () => <Skeleton height="100vh" width="100%" animate={true} />
});

export default function MapPage() {
  return (
    <Box
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",  // Changed from "absolute" to "relative"
      }}
    >
      <MapComponent />
    </Box>
  );
}