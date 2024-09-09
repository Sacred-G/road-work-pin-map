import React, { useState, useEffect, useRef } from 'react';
import { Accordion, Text, Button, Box } from '@mantine/core';
import { IconMenu2 } from '@tabler/icons-react';
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

import './glassEffect.css';
import './markerList.css';
import { PinData } from '../types';

interface MarkerListProps {
  pinsList: PinData[];
  setPopupInfo: (info: PinData | null) => void;
  popupInfo: PinData | null;
  selectedMarker: PinData | null;
}

const MarkerList: React.FC<MarkerListProps> = ({ pinsList, setPopupInfo, popupInfo, selectedMarker }) => {
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const streetViewRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const glassEffectStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    width: isMobile ? '100%' : '300px',
    background: 'rgba(125, 126, 130, 0.27)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)', // For Safari
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: isMobile ? '10px 10px 0 0' : '10px 0 0 10px',
    color: 'white',
    padding: '10px',
    overflow: 'auto',
    zIndex: 1,
    transition: 'transform 0.3s ease-in-out',
    transform: isMenuOpen ? 'translateY(0)' : isMobile ? 'translateY(100%)' : 'translateX(100%)',
  };

  const menuButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? 'auto' : '10px',
    bottom: isMobile ? '10px' : 'auto',
    right: isMobile ? '50%' : isMenuOpen ? '310px' : '10px',
    transform: isMobile ? 'translateX(50%)' : 'none',
    zIndex: 2,
    transition: 'right 0.3s ease-in-out, bottom 0.3s ease-in-out',
  };

  const getStreetViewStyle = (pinId: string): React.CSSProperties => ({
    width: '100%',
    height: hoveredPinId === pinId ? '200px' : '150px',
    marginTop: '10px',
    borderRadius: '10px',
    overflow: 'none',
    transition: 'height 0.3s ease-in-out',
  });

  useEffect(() => {
    if (selectedMarker && streetViewRefs.current[selectedMarker.id.toString()] && window.google && window.google.maps) {
      const panorama = new window.google.maps.StreetViewPanorama(streetViewRefs.current[selectedMarker.id.toString()]!, {
        position: { lat: parseFloat(selectedMarker.latitude.toString()), lng: parseFloat(selectedMarker.longitude.toString()) },
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        showRoadLabels: false,
      });
    }
  }, [selectedMarker]);

  const findNearestStreetView = (pin: PinData) => {
    if (window.google && window.google.maps) {
      const streetViewService = new window.google.maps.StreetViewService();
      const radius = 50; // Radius in meters
      streetViewService.getPanorama({ location: { lat: parseFloat(pin.latitude.toString()), lng: parseFloat(pin.longitude.toString()) }, radius: radius }, (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
          // StreetView available, update the panorama
          if (streetViewRefs.current[pin.id.toString()]) {
            new window.google.maps.StreetViewPanorama(streetViewRefs.current[pin.id.toString()]!, {
              position: data?.location?.latLng ?? new google.maps.LatLng(0, 0),
              pov: { heading: 0, pitch: 0 },
              zoom: 1,
              addressControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
              showRoadLabels: false,
            });
          }
        } else {
          console.log("Street View data not found for this location.");
          // You can add a fallback here, like showing a static map image
        }
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={menuButtonStyle}
        variant="filled"
        color="blue"
      >
        <IconMenu2 size={24} />
      </Button>
      <Box style={glassEffectStyle}>
        <Text size="lg" w={700} mb={10}>Road Work Pins:</Text>
        <Accordion variant="contained">
          {pinsList.map((pin) => (
            <Accordion.Item
              key={pin.id}
              value={pin.id.toString()}
              onMouseEnter={() => setHoveredPinId(pin.id.toString())}
              onMouseLeave={() => setHoveredPinId(null)}
              className={selectedMarker && selectedMarker.id === pin.id ? 'selected-marker' : ''}
            >
              <Accordion.Control
                onClick={() => {
                  setPopupInfo(pin);
                  findNearestStreetView(pin);
                }}
              >
                <Text w={500} size="md">
                  {pin.category}
                </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text style={{ wordBreak: 'break-word', marginBottom: '10px' }}>{pin.description}</Text>
                <Text style={{ marginBottom: '10px' }}>
                  <a href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${pin.latitude},${pin.longitude}`} target="_blank" rel="noopener noreferrer">
                    View on Google Maps
                  </a>
                </Text>
                <div
                  ref={(el) => {
                    if (el) {
                      streetViewRefs.current[pin.id.toString()] = el;
                    }
                  }}
                  style={getStreetViewStyle(pin.id.toString())}
                >
                  {selectedMarker?.id !== pin.id && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f0f0' }}>
                      Click to load Street View
                    </div>
                  )}
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Box>
      <style jsx>{`
        .selected-marker {
          background-color: rgba(255, 255, 255, 0.1);
          border-left: 4px solid #007bff;
        }
      `}</style>
    </>
  );
}

export default MarkerList;