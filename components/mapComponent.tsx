I"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl, Popup, MapRef, Marker, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { fetchUserByPinId } from '../lib/data'; // Adjust the import path as needed
import { useSearchParams } from "next/navigation";
import { LoadingOverlay, Autocomplete, Button, Switch, Select } from "@mantine/core";
import ControlPanel from "./controlPanel";
import MapMarkers from "./marker";
import PopupCard from "./popupCard";
import PopupForm from "./popupForm";
import { fetchPinsData } from "../lib/data";
import "./glassEffect.css";
import "./mapbox-directions.css";

import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import _, { identity } from "lodash";
import MarkerList from "./markerList";
import { useLoadScript } from "@react-google-maps/api";
import { PinData } from "../types";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { findUserByEmail, fetchUsers } from '.././lib/data';
import { getSession } from "next-auth/react";
import { Burger } from '@mantine/core';
const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type ViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  transitionDuration?: number;
  bearing?: number;
  pitch: number;
};

interface UserLocation {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: string;
  image: string;
}

type AddressSuggestion = {
  value: string;
  coordinates: [number, number];
};

const StreetView: React.FC<{ position: { lat: number; lng: number }; onClose: () => void }> = ({ position, onClose }) => {
  const streetViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streetViewRef.current && window.google) {
      new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        showRoadLabels: false,
      });
    }
  }, [position]);

  return (
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: '30%', maxWidth: '400px' }}>
      <div ref={streetViewRef} style={{ width: '100%', height: '100%' }} />
      <button onClick={onClose} style={{
        position: 'absolute', top: '10px', right: '10px', zIndex: 1,
        background: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer'
      }}>
        Close
      </button>
    </div>
  );
};

export default function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || "",
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [popupInfo, setPopupInfo] = useState<PinData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);

  const [hoveredUser, setHoveredUser] = useState<UserLocation | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [streetViewPosition, setStreetViewPosition] = useState({ lat: 0, lng: 0 });
  const [navigationEnabled, setNavigationEnabled] = useState(true);
  const [showUserLocations, setShowUserLocations] = useState(false);
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [streetViewEnabled, setStreetViewEnabled] = useState(false);

  const [showTraffic, setShowTraffic] = useState(false);
  const [pinsData, setPinsData] = useState<PinData[]>([]);
  const [directionsEnabled, setDirectionsEnabled] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<PinData | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
 
  const [hoveredPin, setHoveredPin] = useState<PinData | null>(null);
  const [userLocationFound, setUserLocationFound] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMarkerHover = useCallback((pin: PinData | null) => {
    setHoveredPin(pin);
  }, []);

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
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -86.4512,
    latitude: 34.6568,
    zoom: 7,
    bearing: 0,
    pitch: 0,
  });
  const searchParams = useSearchParams();

  const fetchPins = useCallback(async () => {
    setIsLoading(true);
    try {
      const category = searchParams?.get("category") ?? null;
      const user = searchParams?.get("user") ?? null;
      const pin_name = searchParams?.get("pin_name") ?? null;
      const pins = await fetchPinsData(category, user, pin_name);
      setPinsData(pins);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    fetchPins();
  }, [fetchPins]);

  const geoControlRef = useRef<maplibregl.GeolocateControl | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  type MapboxDirectionsInstance = InstanceType<typeof MapboxDirections>;
  const directionsRef = useRef<MapboxDirectionsInstance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current) {
      const mapInstance = mapRef.current.getMap();
      if (mapInstance) {
        const addDirections = () => {
          if (!directionsRef.current) {
            const directions = new MapboxDirections({
              accessToken: mapboxAccessToken,
              unit: "metric",
              profile: "mapbox/driving"
            });
            directionsRef.current = directions;
            mapInstance.addControl(directions, "bottom-right");
          }
        };

        const removeDirections = () => {
          if (directionsRef.current) {
            mapInstance.removeControl(directionsRef.current);
            directionsRef.current = null;
          }
        };

        if (directionsEnabled) {
          addDirections();
        } else {
          removeDirections();
        }

        return () => {
          if (directionsRef.current) {
            removeDirections();
          }
        };
      }
    }
  }, [directionsEnabled, mapRef.current]);

  const handleShowCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  const handleMapStyleChange = (selectedStyle: MapStyleKey) => {
    setMapStyle(mapStyles[selectedStyle]);
  };

  const handleAddressChange = async (value: string) => {
    setAddress(value);
    if (value.length > 2) {
      try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${mapboxAccessToken}&autocomplete=true`);
        const data = await response.json();
        const suggestions = data.features.map((feature: any) => ({
          value: feature.place_name,
          coordinates: feature.center
        }));
        setAddressSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      }
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsLoading(true);
    try {
      const selectedSuggestion = addressSuggestions.find(suggestion => suggestion.value === address);
      if (selectedSuggestion) {
        const [longitude, latitude] = selectedSuggestion.coordinates;
        setViewState({ ...viewState, longitude, latitude, zoom: 7,transitionDuration:500,bearing:0, 
          pitch:0,
        });
      } else {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxAccessToken}`);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          setViewState({ ...viewState, longitude, latitude, zoom: 14,transitionDuration:500,bearing:0, 
            pitch:0,
            });
        } else {
          console.error("No results found for the given address");
        }
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
    setIsLoading(false);
  };
  const handleMarkerClick = async (pin: PinData | null) => {
    setSelectedMarker(pin);
    setIsPopupVisible(true);
    
    if (pin && !isNaN(Number(pin.longitude)) && !isNaN(Number(pin.latitude))) {
      const lon = Number(pin.longitude);
      const lat = Number(pin.latitude);
  
      setViewState({
        ...viewState,
        longitude: lon,
        latitude: lat,
        transitionDuration: 500,
        bearing: 0,
        pitch: 0,
      });

      try {
        const userData = await fetchUserByPinId(pin.id);
        if (userData) {
          setPopupInfo({ ...pin, name: userData.name, email: userData.email, image: userData.image }as PinData);
        } else {
          setPopupInfo(pin);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setPopupInfo(pin);
      }
    } else {
      console.error('Invalid longitude or latitude:', pin?.longitude, pin?.latitude);
    }
  };
  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };
  const handleMapClick = (event: { lngLat: { lat: number; lng: number } }) => {
    const { lngLat } = event;
    if (streetViewEnabled) {
      setStreetViewPosition({ lat: lngLat.lat, lng: lngLat.lng });
      setShowStreetView(true);
    }
  };

  const handleShowUserLocations = () => {
    setShowUserLocations(prevState => !prevState);
    if (!showUserLocations) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const session = await getSession();
            if (session && session.user) {
              const currentUserEmail = session.user.email;
              const userData = await findUserByEmail(currentUserEmail);
              if (userData) {
                const newLocation: UserLocation = {
                  id: 'currentUser',
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  name: userData.name || 'Current User',
                  email: userData.email,
                  role: userData.role || 'User',
                  lastActive: new Date().toISOString(),
                  status: 'Online',
                  image: userData.image || 'images/default-avatar.png'
                };
                setUserLocations([newLocation]);
                setUserProfileImage(newLocation.image);
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        });
      }
    }
  };


  const getCurrentUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const session = await getSession();
          if (session && session.user) {
            const currentUserEmail = session.user.email;
            const userData = await findUserByEmail(currentUserEmail);
            if (userData) {
              const currentUserLocation: UserLocation = {
                id: 'currentUser',
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                name: userData.name || 'Current User',
                email: userData.email,
                role: userData.role || 'User',
                lastActive: new Date().toISOString(),
                status: 'Online',
                image: userData.image || 'images/default-avatar.png'
              };
              setUserLocations(prevLocations => {
                const otherUsers = prevLocations.filter(loc => loc.id !== 'currentUser');
                return [currentUserLocation, ...otherUsers];
              });
              setUserProfileImage(currentUserLocation.image);
              
              // Center the map on the user's location
              setViewState(prevState => ({
                ...prevState,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                zoom: 14,
                transitionDuration: 1000
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching current user data:", error);
        }
      }, (error) => {
        console.error("Error getting user location:", error);
        // Optionally, show an error message to the user
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Optionally, show an error message to the user
    }
  };
  



  useEffect(() => {
    if (showUserLocations) {
      getCurrentUserLocation();
    }
  }, [showUserLocations]);
  // Update the useEffect hook for user locations (around line 220)
  useEffect(() => {
    if (showUserLocations) {
      const interval = setInterval(async () => {
        try {
          const users = await fetchUsers();
          const newLocations = users.slice(0, 3).map((user, index) => ({
            id: user.id || `user${index + 1}`,
            latitude: 34.6568 + (Math.random() - 0.5) * 0.1,
            longitude: -86.4512 + (Math.random() - 0.5) * 0.1,
            name: user.name,
            email: user.email,
            image: user.image || 'images/default-avatar.png',
            lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            status: ['Online', 'Offline', 'Away'][Math.floor(Math.random() * 3)],
            role: user.role || 'User'
          }));
          setUserLocations(prevLocations => {
            const currentUser = prevLocations.find(loc => loc.id === 'currentUser');
            return currentUser ? [currentUser, ...newLocations] : newLocations;
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }, 5000);
  
      return () => clearInterval(interval);
    }
  }, [showUserLocations]);

  const handleUserMarkerHover = (user: UserLocation) => {
    setHoveredUser(user);
  };

  const handleUserMarkerLeave = () => {
    setHoveredUser(null);
  };

  const handleGeolocate = useCallback((e: any) => {
    setViewState({
      longitude: e.coords.longitude,
      latitude: e.coords.latitude,
      zoom: 14,
      transitionDuration: 1000,
      bearing: 0,
      pitch: 0,
    });
    setUserLocationFound(true);
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  
  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      
      <div style={{ position: "relative", height: "100%" }}> 
      <div
  className={`glass-effect control-panel ${menuVisible ? 'visible' : ''}`}
style={{
  position: "fixed",
  zIndex: 1,
  top: "50%",
  left: "50%",
  transform: menuVisible ? "translate(-50%, -150%)" : "translate(-50%, -260%)",
  padding: "10px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: "300px",
  width: "90%",
  transition: "transform 0.3s ease-in-out",

   
  }}
>
          <Select
            label="Map Style"
            placeholder="Choose a style"
            data={[
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'streets', label: 'Streets' },
              { value: 'satellite', label: 'Satellite' },
              { value: 'terrain', label: 'Terrain' },
              { value: 'streets_dark', label: 'Streets Dark' },
              { value: 'dataviz_dark', label: 'Dataviz Dark' },
            ]}
            onChange={(value) => handleMapStyleChange(value as MapStyleKey)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
          <form onSubmit={handleAddressSubmit} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Autocomplete
              placeholder="Enter address"  
              value={address}
              onChange={handleAddressChange}    
              data={addressSuggestions.map(suggestion => suggestion.value)}
              style={{ marginBottom: "10px", width: "100%" }}
            />
            <Button type="submit" style={{ marginBottom: "10px", width: "100%" }}>Go to Location</Button>
          </form>
          <Button onClick={handleShowUserLocations} style={{ marginBottom: "10px", width: "100%" }}>
            {showUserLocations ? "Hide User Locations" : "Show User Locations"}
          </Button>

          <div className="switches-container">
            <Switch
              checked={navigationEnabled}
              onChange={(event) => setNavigationEnabled(event.currentTarget.checked)}
              label="Navigation"
            />
            <Switch
              checked={streetViewEnabled}
              onChange={(event) => setStreetViewEnabled(event.currentTarget.checked)}
              label="Street View"
            />
            <Switch
              checked={directionsEnabled}
              onChange={(event) => setDirectionsEnabled(event.currentTarget.checked)}
              label="Directions"
            />
            <Switch
              checked={showTraffic}
              onChange={(event) => setShowTraffic(event.currentTarget.checked)}
              label="Traffic"
            />
          </div>
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <Map
            {...viewState}
            onMove={evt => setViewState({...evt.viewState})}
            style={{ width: "100%", height: "100%" }}
            mapStyle={mapStyle}
            ref={mapRef}
            onClick={(event) => handleMapClick(event)}
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
              onMarkerHover={handleMarkerHover}
            />
            {popupInfo && (
              <Popup
                anchor="center"
                longitude={Number(popupInfo.longitude)}
                latitude={Number(popupInfo.latitude)}
                onClose={() => setPopupInfo(null)}
                offset={[0, -15] as [number, number]}
              >
                <PopupCard
                  popupInfo={popupInfo}
                  fetchPins={fetchPins}
                  setPopupInfo={setPopupInfo}
                />
              </Popup>
            )}
            {showUserLocations && userLocations.map((location) => (
              <Marker
                key={location.id}
                longitude={location.longitude}
                latitude={location.latitude}
                anchor="center"
              >
                <div
                  onMouseEnter={() => handleUserMarkerHover(location)}
                  onMouseLeave={handleUserMarkerLeave}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: location.id === 'currentUser' ? '3px solid #00FF00' : '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                  }}
                >
                  <img 
                    src={location.image}
                    alt={location.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'images/default-avatar.png';
                    }}
                  />
                </div>
              </Marker>
            ))}
            {hoveredUser && (
              <Popup
                anchor="top"
                longitude={hoveredUser.longitude}
                latitude={hoveredUser.latitude}
                closeButton={false}
                closeOnClick={false}
                offset={[0, -20] as [number, number]}
              >
                <div className="user-popup">
                  <img 
                    src={hoveredUser.image}
                    alt={hoveredUser.name} 
                    style={{
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      marginBottom: 10,
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }} 
                    onError={(e) => {
                      e.currentTarget.src = 'images/default-avatar.png';
                    }}
                  />
                  <h3>{hoveredUser.name}</h3>
                  <p>Email: {hoveredUser.email}</p>
                  <p>Role: {hoveredUser.role}</p>
                  <p>Last Active: {new Date(hoveredUser.lastActive).toLocaleString()}</p>
                  <p>Status: {hoveredUser.status}</p>
                </div>
              </Popup>
            )}

            <GeolocateControl
              positionOptions={{ enableHighAccuracy: true }}
              trackUserLocation={true}
              showUserLocation={false}
              ref={geoControlRef}
              onGeolocate={handleGeolocate}
            />
            {navigationEnabled && <NavigationControl />}
            {userProfileImage && userLocationFound && (
              <Marker
                longitude={viewState.longitude}
                latitude={viewState.latitude}
                anchor="center"
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #00FF00',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  <img 
                    src={userProfileImage}
                    alt="User location"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'images/default-avatar.png';
                    }}
                  />
                </div>
              </Marker>
            )}
          </Map>

          <MarkerList
            pinsList={pinsData}
            setPopupInfo={handleMarkerClick}
            popupInfo={popupInfo}
            selectedMarker={selectedMarker}
          />

        </div>
        <ControlPanel
          longitude={viewState.longitude}
          latitude={viewState.latitude}
          handleShowCreateForm={handleShowCreateForm}
          showCreateForm={showCreateForm}
        />
        <Burger
opened={menuVisible}
onClick={toggleMenu}
size="sm"
  className="menu-button"
styles={{
  root: {
    position: 'fixed',
    top: '7%',
    left: '-3%',
    transform: "translate(-50%, -150%)",
    zIndex: 3,
  },
}}
/>
        {showStreetView && isLoaded && (
          <StreetView
            position={streetViewPosition}
            onClose={() => setShowStreetView(false)}
          />
        )}
        
      </div>
      <style jsx>{`
        .control-panel {
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 600px) {
          .control-panel {
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: none;
          }
        }
        .directions-control {
          pointer-events: auto;
        }
        .user-popup {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          padding: 15px;
          color: white;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .user-popup h3 {
          margin-top: 0;
          margin-bottom: 10px;
        }
        .user-popup p {
          margin: 5px 0;
        }
        .switches-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
          width: 100%;
        }
        .switches-container .mantine-Switch-root {
          margin: 0;
          width: calc(50% - 5px);
        }
        @media (max-width: 400px) {
          .switches-container .mantine-Switch-root {
            width: 100%;
          }
        }
          .control-panel {
  transition: transform 0.3s ease-in-out;
}

.menu-button {
  display: none;
}

@media (max-width: 768px) {
  .control-panel {
    transform: translateX(-100%);
  }

  .control-panel.visible {
    transform: translateX(0);
  }

  .menu-button {
    display: flex;
  }
}
      `}</style>
    </>
  );
}
