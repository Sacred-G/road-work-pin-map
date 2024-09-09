import React, { useEffect, useState } from 'react';
import { Box, Text, Loader } from '@mantine/core';
import axios from 'axios';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
}

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get<WeatherData>(
          `https://api.openweathermap.org/data/2.5/weather?zip=35962,us&appid=29c678f51015f137e5d7367e33a18fc5&units=imperial`
        );
        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch weather data');
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Text color="red">{error}</Text>;
  if (!weatherData) return null;

  return (
    <Box className="glass-effect" p="sm">
      <Text size="lg" w={500}>Weather for 35962</Text>
      <Text>Temperature: {Math.round(weatherData.main.temp)}°F</Text>
      <Text>Feels like: {Math.round(weatherData.main.feels_like)}°F</Text>
      <Text>Min: {Math.round(weatherData.main.temp_min)}°F, Max: {Math.round(weatherData.main.temp_max)}°F</Text>
      <Text>{weatherData.weather[0].main} - {weatherData.weather[0].description}</Text>
      <Text>Humidity: {weatherData.main.humidity}%</Text>
      <Text>Pressure: {weatherData.main.pressure} hPa</Text>
      <Text>Wind: {weatherData.wind.speed} mph, {weatherData.wind.deg}°</Text>
      <Text>Visibility: {weatherData.visibility / 1000} km</Text>
      <img
        src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
        alt={weatherData.weather[0].description}
      />
    </Box>
  );
};

export default WeatherWidget;