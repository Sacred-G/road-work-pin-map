import { useState, useEffect } from "react";

const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key is missing');
        return;
      }

      if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        initializeServices();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => {
        if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
          initializeServices();
        } else {
          console.error('Google Maps API failed to load properly.');
        }
      };
      script.onerror = () => {
        console.error('Error loading Google Maps API script.');
      };
      document.head.appendChild(script);
    };

    const initializeServices = () => {
      if (window.google && window.google.maps) {
        setAutocompleteService(new google.maps.places.AutocompleteService());
        setPlacesService(new google.maps.places.PlacesService(document.createElement('div')));
        setGeocoder(new google.maps.Geocoder());
        setLoaded(true);
      }
    };

    loadGoogleMaps();
  }, []);

  return { loaded, autocompleteService, placesService, geocoder };
};

export default useGoogleMaps
