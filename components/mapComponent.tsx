"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "./maplibreglPopupContent.css";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@mantine/core";

import ControlPanel from "./controlPanel";
import MapMarkers from "./marker";
import PopupCard from "./popupCard";
import PopupForm from "./popupForm";

import { fetchPinsData } from "@/lib/data";
import "./glassEffect.css";
import "./mapbox-directions.css"
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@lib/mapbox-directions";

mapboxgl.accessToken = "pk.eyJ1Ijoic2JvdWxkaW4iLCJhIjoiY2x2ajMxdHUyMTkxMDJpcHUydzZxMzV4ZSJ9.lsPxcmST-IYlN7BgejSRhw";

export default function MapComponent() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mapStyles = {
    hybrid: "https://api.maptiler.com/maps/hybrid/style.json?key=z77nEry6rP70PZq17SYM",
    streets: "https://api.maptiler.com/maps/streets/style.json?key=z77nEry6rP70PZq17SYM",
    terrain: "https://api.maptiler.com/maps/terrain/style.json?key=z77nEry6rP70PZq17SYM",
    satellite: "https://api.maptiler.com/maps/satellite/style.json?key=z77nEry6rP70PZq17SYM",
    streets_dark: "https://api.maptiler.com/maps/d8267d89-7919-4698-995b-ac6330ebfc97/style.json?key=z77nEry6rP70PZq17SYM",
    dataviz_dark: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=z77nEry6rP70PZq17SYM",
  };

  type MapStyleKey = keyof typeof mapStyles;

  const [mapStyle, setMapStyle] = useState(mapStyles.streets_dark);

  const handleShowCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  const handleMapStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStyle = event.target.value as MapStyleKey;
    setMapStyle(mapStyles[selectedStyle]);
  };

  const [viewState, setViewState] = useState({
    longitude: -86.4512,
    latitude: 34.6568,
    zoom: 7,
  });

  const searchParams = useSearchParams();
  const [pinsData, setPinsData] = useState([]);

  const fetchPins = React.useCallback(async () => {
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
  }, [searchParams]);

  useEffect(() => {
    setPinsData([]);
    fetchPins();
  }, [fetchPins, searchParams]);

  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // make geolocate trigger on load
    geoControlRef.current?.trigger();

    if (mapRef.current) {
      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
      });

      mapRef.current.addControl(directions, "bottom-right");

      // Prevent pointer events on directions control
      const directionsControlElement = document.querySelector(".mapboxgl-ctrl-directions");
      if (directionsControlElement) {
        directionsControlElement.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }
  }, [mapRef.current]);

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <div style={{ position: "relative", height: "100%" }}>
        <div
          className="glass-effect"
          style={{
            position: "absolute",
            zIndex: 1,
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 10px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div id="mapStyleContainer">
            <label htmlFor="mapStyleSelect" style={{ marginRight: "8px" }}>
              Map Style:
            </label>
            <select id="mapStyleSelect" onChange={handleMapStyleChange}>
              <option value="hybrid">Hybrid</option>
              <option value="streets">Streets</option>
              <option value="satellite">Satellite</option>
              <option value="terrain">Terrain</option>
              <option value="streets_dark">Streets Dark</option>
              <option value="dataviz_dark">Dataviz Dark</option>
            </select>
          </div>
        </div>
        <Map
          initialViewState={viewState}
          style={{ height: "100%", position: "absolute", top: 0, left: 0 }}
          mapStyle={mapStyle}
          onMove={(e) => setViewState(e.viewState)}
          ref={mapRef}
        >
          <PopupForm
            latitude={viewState.latitude}
            longitude={viewState.longitude}
            fetchPins={fetchPins}
            setShowCreateForm={setShowCreateForm}
            setPopupInfo={setPopupInfo}
            showCreateForm={showCreateForm}
          />

          <MapMarkers setPopupInfo={setPopupInfo} pinsData={pinsData} />
          {popupInfo && (
            <Popup
              anchor="top"
              longitude={Number((popupInfo as any).longitude)}
              latitude={Number((popupInfo as any).latitude)}
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
        <ControlPanel
          longitude={viewState.longitude}
          latitude={viewState.latitude}
          handleShowCreateForm={handleShowCreateForm}
          showCreateForm={showCreateForm}
        />
      </div>
      <style jsx>{`
        #mapStyleContainer {
          display: none;
        }

        @media (min-width: 600px) {
          #mapStyleContainer {
            display: inline-block;
          }
        }

        @media (max-width: 600px) {
          #mapStyleContainer {
            position: absolute !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            display: block !important;
            background: rgba(255, 255, 255, 0.8) !important;
            padding: 5px 10px !important;
            border-radius: 4px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
          }
        }

        .control-panel {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 600px) {
          .control-panel {
            flex-direction: row;
            flex-wrap: wrap;
          }
        }

        .directions-control {
          pointer-events: auto;
        }
      `}</style>
    </>
  );
}
