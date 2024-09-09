'use client'

import { useState, useEffect } from 'react';
import MapComponent from './mapComponent';

export default function ClientMapWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading map component...</div>;
  }

  return <MapComponent />;
}