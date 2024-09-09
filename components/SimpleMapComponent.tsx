'use client';

import React from 'react';
import { Box } from '@mantine/core';

const SimpleMapComponent: React.FC = () => {
  return (
    <Box
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <h1>Simple Map Component</h1>
    </Box>
  );
};

export default SimpleMapComponent;