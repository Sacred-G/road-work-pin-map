"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl, Popup, MapRef, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import "./maplibreglPopupContent.css";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay, Button } from "@mantine/core";
import ControlPanel from "./controlPanel";
import MapMarkers from "./marker";
import PopupCard from "./popupCard";
import PopupForm from "./popupForm";
import { fetchPinsData, fetchCategories, fetchUsers } from "@/lib/data";
import "./glassEffect.css";
import "./mapbox-directions.css";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import _ from "lodash";
import Navbar from "./navbar";

// Ensure the API key is stored securely
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface PinData {
  id: string;
  longitude: number;
  latitude: number;
  pin_name: string;
  category: string;
  description: string;
}

export default function MapComponent() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PinData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<PinData | null>(null);
  const [pinsData, setPinsData] = useState<PinData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const mapStyles = {
    hybrid: "https://api.maptiler.com/maps/hybrid/style.json?key=z77nEry6rP70PZq17SYM",
    streets: "https://api.maptiler.com/maps/streets/style.json?key=z77nEry6rP70PZq17SYM",
    terrain: "https://api.maptiler.com/maps/terrain/style.json?key=z77nEry6rP70PZq17SYM",
    satellite: "https://api.maptiler.com/maps/satellite/style.json?key=z77nEry6rP70PZq17SYM",
    streets_dark: "https://api.maptiler.com/maps/d8267d89-7919-4698-995b-ac6330ebfc97/style.json?key=z77nEry6rP70PZq17SYM",
    dataviz_dark: "https://api.maptiler.com/maps/dataviz-dark/style.json?key=z77nEry6rP70PZq17SYM"
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

  const toggleTraffic = useCallback(() => {
    setShowTraffic(prev => !prev);
  }, []);

  const [viewState, setViewState] = useState({
    longitude: -86.4512,
    latitude: 34.6568,
    zoom: 7
  });

  const searchParams = useSearchParams();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        const fetchedUsers = await fetchUsers();
        setCategories(fetchedCategories);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching categories and users:", error);
      }
    };
    fetchData();
  }, []);

  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  type MapboxDirectionsInstance = InstanceType<typeof MapboxDirections>;
  const directionsRef = useRef<MapboxDirectionsInstance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current) {
      const mapInstance = mapRef.current.getMap();

      if (mapInstance) {
        const directions = new MapboxDirections({
          accessToken: mapboxAccessToken,
          unit: "metric",
          profile: "mapbox/driving"
        });

        directionsRef.current = directions;
        mapInstance.addControl(directions, "bottom-right");

        // Cleanup function to remove the control when the component is unmounted
        return () => {
          if (directionsRef.current) {
            mapInstance.removeControl(directionsRef.current);
          }
        };
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
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
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
          <Button onClick={toggleTraffic} style={{ marginLeft: '10px' }}>
            {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
          </Button>
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

          <MapMarkers
            setPopupInfo={setPopupInfo}
            pinsData={pinsData}
            setSelectedMarker={setSelectedMarker}
          />
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

          {showTraffic && (
            <Source
              id="traffic"
              type="vector"
              url="https://api.mapbox.com/v4/mapbox.mapbox-traffic-v1.json?access_token=sk.eyJ1Ijoic2JvdWxkaW4iLCJhIjoiY20wd3A5a21tMDRqZjJqb2U3ZzhhbDl1cyJ9.xikk2DHVlMhbheYIXGvgPA"
            >
              <Layer
                id="traffic-layer"
                type="line"
                source="traffic"
                source-layer="traffic"
                paint={{
                  "line-width": 2,
                  "line-color": [
                    "case",
                    ["==", "low", ["get", "congestion"]], "#00FF00",
                    ["==", "moderate", ["get", "congestion"]], "#FFFF00",
                    ["==", "heavy", ["get", "congestion"]], "#FF0000",
                    ["==", "severe", ["get", "congestion"]], "#800000",
                    "#000000"
                  ]
                }}
              />
            </Source>
          )}
        </Map>
        <ControlPanel
          longitude={viewState.longitude}
          latitude={viewState.latitude}
          handleShowCreateForm={handleShowCreateForm}
          showCreateForm={showCreateForm}
        />
        <Navbar
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
          popupInfo={popupInfo}
          setPopupInfo={setPopupInfo}
          pinsData={pinsData}
          categories={categories}
          users={users}
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