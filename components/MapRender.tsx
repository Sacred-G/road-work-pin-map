'use client'
import React, { useEffect, useRef } from "react";
import Map, { NavigationControl, GeolocateControl, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import PopupForm from "./popupForm";
import MapMarkers from "./marker";
import PopupCard from "./popupCard";
import { debounce } from "lodash";
import { ViewState } from "react-map-gl";
type MapRenderProps = {
  mapStyle: string;
  viewState: ViewState;
  setViewState: (state: ViewState) => void; 
  popupInfo: Pin | null;
  setPopupInfo: (popupInfo: Pin | null) => void;
  fetchPins: () => void;
  showCreateForm: boolean;
  setShowCreateForm: (showCreateForm: boolean) => void;
  pinsData: Pin[];
};
type Pin = {
    id?: number; // Assuming each pin has a unique ID
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    category: string; // Assuming there's a category associated with each pin
    isActive: boolean; // Assuming there's an active status for each pin
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
  pinsData
}: MapRenderProps) {
  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);

  useEffect(() => {
    // make geolocate trigger on load
    geoControlRef.current?.trigger();
  }, []);

  const debouncedSetViewState = debounce(setViewState, 200);
  interface PinData {
    id: string;
    latitude: number;
    longitude: number;
  }
  const convertedPinsData: PinData[] = pinsData.map((pin) => ({
    id: pin.id!.toString(), // Convert number to string if necessary
    latitude: pin.latitude,
    longitude: pin.longitude
    // Copy other properties as needed
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
      <MapMarkers setPopupInfo={setPopupInfo} pinsData={convertedPinsData} />

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
      <NavigationControl />
    </Map>
  );
}
