"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibreglPopupContent.css";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@mantine/core";
import { debounce } from "lodash";

import MapMarkers from './marker';
import PopupCardDisplay from "./popupCardDisplay"; // Ensure correct import path
import PopupForm from "./popupForm";
import Sidebar from "./sidebar";
import PinCards from "./pinCards";
import { fetchPinsData } from "@/lib/data";

interface PinData {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  pin_name: string;
  image_url: string;
  category: string;
  is_active: boolean;
  tag?: string[];
  created_at: string;
  updated_at: string;
}

interface PopupInfo extends Partial<Omit<PinData, 'id'>> {
  id?: string; // Now explicitly optional and of type string
}

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  padding: { top: number; bottom: number; left: number; right: number };
  width: any;
  height: any;
};


export default function MapComponent() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);



  const debouncedHandleMapMove = useCallback(
    debounce((e: { viewState: Partial<ViewState> }) => {
      setViewState(prevViewState => ({
        ...prevViewState,
        ...e.viewState,
      }));
    }, 100),
    []
  );
  const handleMapMove = useCallback((e: { viewState: Partial<ViewState> }) => {
    setViewState(prevViewState => ({
      ...prevViewState,
      ...e.viewState,
    }));
  }, []);
  const handleShowCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  const [viewState, setViewState] = useState<ViewState>({
    longitude: -86.05402,
    latitude: 34.47003,
    zoom: 7,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const searchParams = useSearchParams();
  const [pinsData, setPinsData] = useState<PinData[]>([]);

  const fetchPins = async () => {
    setIsLoading(true);
    try {
      const category = searchParams.get("category");
      const user = searchParams.get("user");
      const pin_name = searchParams.get("pin_name");
      const pins = await fetchPinsData(category, user, pin_name);
      setPinsData(pins);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setPinsData([]);
    fetchPins();
  }, [searchParams]);

  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);

  useEffect(() => {
    if (geoControlRef.current) {
      geoControlRef.current.trigger();
    }
  }, []);

  const handleMarkerHover = (index: number | null) => {
    setHoveredTab(index);
  };

  const handleTabHover = (index: number | null) => {
    setHoveredTab(index);
    if (index !== null) {
      setPopupInfo({ ...pinsData[index], id: pinsData[index].id.toString() });

  // Set popup info on hover
  };

  const handleTabClick = (index: number) => {
    setSelectedMarker(index);
    const location = { ...pinsData[index], id: pinsData[index].id.toString() };
    setPopupInfo(location); // Set popup info on click
    setViewState((prevState) => ({
      ...prevState,
      longitude: location.longitude,
      latitude: location.latitude,
    }));
  };

    



  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '70%', height: '100%' }}>
      <Map
         {...viewState}
         style={{ height: '100%' }}
         mapStyle="https://api.maptiler.com/maps/streets/style.json?key=z77nEry6rP70PZq17SYM"
         onMove={debouncedHandleMapMove} // or use handleMapMove if you don't want debounce
       >
       
            <PopupForm
              latitude={viewState.latitude}
              longitude={viewState.longitude}
              fetchPins={fetchPins}
              setShowCreateForm={setShowCreateForm}
              setPopupInfo={setPopupInfo}
              showCreateForm={showCreateForm}
            />

<MapMarkers
          setPopupInfo={setPopupInfo}
          pinsData={pinsData}
          onMarkerHover={(index) => setHoveredPin(index)}
          hoveredPin={hoveredPin}
          hoveredTab={hoveredTab}
        />
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={Number(popupInfo.longitude)}
                latitude={Number(popupInfo.latitude)}
                onClose={() => setPopupInfo(null)}
              >
                {popupInfo.pin_name ? (
                  <PopupCardDisplay popupInfo={popupInfo as PopupInfo} />
                ) : (
                  <div>Loading...</div>
                )}
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
        </div>
        </div>
    <div style={{ width: '30%', height: '100%', overflowY: 'scroll' }}>
      <PinCards
        pinsData={pinsData}
        hoveredPin={hoveredPin}
        onCardHover={(index: number | null) => setHoveredPin(index)}
        />
    </div>
  
    </>
  );
  }}
