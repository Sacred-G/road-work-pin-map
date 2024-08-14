"use client";

import { Marker } from "react-map-gl";
import Pin from "./pin";
import { useMemo } from "react";
import "./maplibreglPopupContent.css";


interface PinData {
  id: number; // Add this line
  name: string;
  description: string;
  longitude: number;
  latitude: number;
}
interface MapMarkersProps {
  setPopupInfo: (info: any) => void;
  pinsData: PinData[];
  onMarkerHover: (index: any) => void;
  hoveredTab: any; // Add this line
  selectedMarker?: any; // Make it optional if it's not always required
  hoveredPin?: number | null; // Added this line
}
export default function MapMarkers({
  setPopupInfo,
  pinsData,
  onMarkerHover,
  hoveredPin,
}: MapMarkersProps) {
  const imageUrl = "https://i.ibb.co/z8dwbcQ/working-clipart-work-order-17.png";

  const pins = useMemo(() => pinsData.map((city, index) => (
    <div
      key={city.id}
      onMouseEnter={() => onMarkerHover(index)}
      onMouseLeave={() => onMarkerHover(null)}
    >
      <Marker
        longitude={city.longitude}
        latitude={city.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setPopupInfo(city);
        }}
      >
        <Pin
          size={20}
          imageUrl={imageUrl}
          style={{
            transform: `scale(${hoveredPin === index ? 1.5 : 1})`,
            transition: 'transform 0.3s ease-in-out',
          }}
        />
      </Marker>
    </div>
  )),[]);

  // Ensure the component returns the pins JSX
  return pins;
}