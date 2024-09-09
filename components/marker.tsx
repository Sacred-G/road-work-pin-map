import React, { useMemo } from "react";
import { Marker } from "react-map-gl";
import Pin from "./pin";
import { PinData } from "../types";



interface MapMarkersProps {
  setPopupInfo: (pin: PinData | null) => void;
  pinsData: PinData[];
  onMarkerHover?: OnMarkerHoverCallback;
}


type OnMarkerHoverCallback = (pin: PinData | null) => void;

interface MapMarkersProps {
  setPopupInfo: (pin: PinData | null) => void;
  pinsData: PinData[];
  onMarkerHover?: OnMarkerHoverCallback;
}

export default function MapMarkers({
  setPopupInfo,
  pinsData,
  onMarkerHover
}: MapMarkersProps) {
  const pins = useMemo(
    () => (
      <>
        {pinsData.map((pin) => (
          <div
            key={pin.id}
            onMouseEnter={() => onMarkerHover?.(pin)}
            onMouseLeave={() => onMarkerHover?.(null)}
            style={{ position: 'absolute', transform: 'translate(-50%, -50%)' }}
          >
            <Marker
              longitude={pin.longitude}
              latitude={pin.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(pin);
              }}
            >
              <Pin size={30} />
            </Marker>
          </div>
        ))}
      </>
    ),
    [pinsData, setPopupInfo, onMarkerHover]
  );

  return <>{pins}</>;
}