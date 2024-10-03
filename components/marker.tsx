"use client";

import { Marker } from "react-map-gl";
import Pin from "./pin";
import { useMemo } from "react";

interface PinData {
  id: string;
  longitude: number;
  latitude: number;
}

interface MapMarkersProps {
  setPopupInfo: (info: PinData | null) => void;
  pinsData: PinData[];
  setSelectedMarker: (marker: PinData | null) => void;
}

export default function MapMarkers({
  setPopupInfo,
  pinsData,
  setSelectedMarker,
}: MapMarkersProps) {
  const pins = useMemo(
    () =>
      pinsData.map((city) => (
        <Marker
          style={{ zIndex: 1 }}
          key={city.id}
          longitude={city.longitude}
          latitude={city.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(city);
            setSelectedMarker(city);
          }}
        >
          <Pin size={40} />
        </Marker>
      )),
    [pinsData, setPopupInfo, setSelectedMarker]
  );

  return <>{pins}</>;
}