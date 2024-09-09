'use client'
import React, { useEffect, useRef, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl, Popup, MapRef, ViewState } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import PopupForm from "./popupForm";
import MapMarkers from "./marker";
import PopupCard from "./popupCard";
import { debounce } from "lodash";
import { PinData } from '../types';

type Pin = {
  id?: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  name: string;
  email:string;
  image: string;
};

type MapRenderProps = {
  mapStyle: string;
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  popupInfo: Pin | null;
  setPopupInfo: React.Dispatch<React.SetStateAction<Pin | null>>;
  fetchPins: () => void;
  showCreateForm: boolean;
  setShowCreateForm: (showCreateForm: boolean) => void;
  pinsData: Pin[];
  navigationEnabled: boolean;
  setNavigationStart: (start: [number, number] | null) => void;
};
export default function MapRender({
  mapStyle,
  viewState,
  setViewState,
  popupInfo,
  setPopupInfo,
  fetchPins,
  showCreateForm,
  setShowCreateForm,
  pinsData,
  navigationEnabled,
  setNavigationStart,
}: MapRenderProps) {
  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    geoControlRef.current?.trigger();
  }, []);

  const debouncedSetViewState = debounce(setViewState, 200);

  // New function to handle setting popup info
  const handleSetPopupInfo = useCallback((pin: PinData | null) => {
    setPopupInfo(pin as Pin | null);
  }, [setPopupInfo]);

  const convertedPinsData: PinData[] = pinsData.map((pin) => ({
    id: pin.id!,
    latitude: pin.latitude,
    longitude: pin.longitude,
    title: pin.title,
    description: pin.description,
    category: pin.category,
    isActive: pin.isActive,
    name: pin.name || '', // Add this line
    email: pin.email || '', // Add this line
    image: pin.image || '', // Add this if it exists in your Pin type, otherwise omit
    pin_name: pin.title, // Assuming pin_name is the same as title
    is_active: pin.isActive, // Assuming is_active is the same as isActive
    // Add any other properties that are in PinData but not in Pin
  }));

  return (
    <Map
      initialViewState={viewState}
      style={{ height: "100%", position: "absolute", top: 0, left: 0 }}
      mapStyle={mapStyle}
      onMove={(e) => debouncedSetViewState(e.viewState)}
    >
      <PopupForm
        latitude={viewState.latitude}
        longitude={viewState.longitude}
        fetchPins={fetchPins}
        setShowCreateForm={setShowCreateForm}
        setPopupInfo={setPopupInfo}
        showCreateForm={showCreateForm}
      />
      <MapMarkers setPopupInfo={handleSetPopupInfo} pinsData={convertedPinsData} />
      {popupInfo && (
        <Popup
          anchor="top"
          longitude={Number(popupInfo.longitude)}
          latitude={Number(popupInfo.latitude)}
          onClose={() => setPopupInfo(null)}
        >
          <PopupCard
            popupInfo={popupInfo}
            fetchPins={fetchPins}
            setPopupInfo={setPopupInfo}
          />
        </Popup>
      )}
      <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserLocation={true}
        ref={geoControlRef}
      />
      {navigationEnabled && <NavigationControl />}
    </Map>
  );
}