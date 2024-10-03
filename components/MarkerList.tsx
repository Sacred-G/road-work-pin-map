import React, { useState, useEffect, useRef } from 'react';
import { Text, Accordion } from '@mantine/core';
import { PinData } from './types/pinTypes';

interface MarkerListProps {
  pinsList: PinData[];
  setPopupInfo: (info: PinData | null) => void;
  popupInfo: PinData | null;
  selectedMarker: PinData | null;
}

const MarkerList: React.FC<MarkerListProps> = ({ pinsList, setPopupInfo, popupInfo, selectedMarker }) => {
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const streetViewRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const glassEffectStyle: React.CSSProperties = {
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    color: 'white',
    padding: '10px',
    maxWidth: '300px',
    width: '300px',
    overflow: 'auto',
  };

  const getStreetViewStyle = (pinId: string): React.CSSProperties => ({
    width: '100%',
    height: hoveredPinId === pinId ? '300px' : '200px',
    marginTop: '10px',
    borderRadius: '10px',
    overflow: 'hidden',
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
      const radius = 50;
      streetViewService.getPanorama({ location: { lat: parseFloat(pin.latitude.toString()), lng: parseFloat(pin.longitude.toString()) }, radius: radius }, (data, status) => {
        if (status === window.google.maps.StreetViewStatus.OK) {
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
        }
      });
    }
  };

  return (
    <div style={glassEffectStyle}>
      <Text size="lg" fw={700} mb={10}>Road Work Pins:</Text>
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
              <Text fw={500} size="md">
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
      <style jsx>{`
        .selected-marker {
          background-color: rgba(255, 255, 255, 0.1);
          border-left: 4px solid #007bff;
        }
      `}</style>
    </div>
  );
}

export default MarkerList;