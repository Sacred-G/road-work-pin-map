'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box } from "@mantine/core";
import Navbar from '@/components/navbar'; // Adjust the path if necessary
import "../../styles/globals.css"
// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import("../../components/mapComponent"), {
  ssr: false,
});

export default function Home() {
  const [route, setRoute] = useState<{
    addressA: string;
    addressB: string;
  } | null>(null);

  // Function to set the route, this could come from a form submission or other logic
  const handleSetRoute = (addressA: string, addressB: string) => {
    setRoute({ addressA, addressB });
  };

  return (
    <Box
      style={{
        width: "100%",
        height: "100vh",
        position: "absolute",
        display: "inline-block"
      }}
    >
      <Navbar setRoute={handleSetRoute} />
      <MapComponent route={route} />
    </Box>
  );
}
