import { useState } from 'react'
import axios from 'axios';
import {
  Search,
  Wind,
  Thermometer,
  Sun,
  Cloud,
  CloudRain
} from 'lucide-react';
import './App.css'

const App = () => {

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError(null);
      setWeather(null)

      const geoRes = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: cityName, count: 1 }
      });

      if (!geoRes.data.results || geoRes.data.results.lenght === 0) {
        setError('City not found!');
        setWeather(null);
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoRes.data.results[0];

      const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: { latitude, longitude, current_weather: true }
      });

      setWeather({
        city: `${name}, ${country}`,
        temperature: weatherRes.data.current_weather.temperature,
        wind: weatherRes.data.current_weather.windspeed,
        code: weatherRes.data.current_weather.weatherCode
      });

    } catch (error) {
      setError('Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (city.trim()) {
      fetchWeather(city.trim());
    }
  }

  const getBackgroundClass = () => {
    if (!weather) return "default-bg";
    if (weather.code === 0) return "sunny-bg";
    if (weather.code >= 51 && weather.code <= 67) return "rainy-bg";
    if (weather.code >= 71 && weather.code <= 77) return "snow-bg";
    if (weather.code >= 1 && weather.code <= 3) return "cloudy-bg";
    return "default-bg";
  };


  const getWeatherIcon = () => {
    if (!weather) return null;
    if (weather.code === 0) return <Sun className="icon sunny" size={36} />;
    if (weather.code >= 51 && weather.code <= 67) return <CloudRain className="icon rainy" size={36} />;
    if (weather.code >= 1 && weather.code <= 3) return <Cloud className="icon cloudy" size={36} />;
    return <Cloud className="icon cloudy" size={36} />;
  };

  return (
    <div className={`app-container ${getBackgroundClass()}`}>
      <div className="card">
        <h1 className='title'>Weather App</h1>

        <form onSubmit={handleSubmit} className='form'>
          <input
            type="text"
            name="city"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder='Search city'
            className='input'
          />
          <button type='submit' className='button' >
            <Search size={20} />
          </button>
        </form>

        {loading && <p className='loading'>Fetching weather...</p>}
        {error && <p className='error'>Error</p>}

        {weather && (
          <div className="weather-card">
            <div className="icon-container">{getWeatherIcon()}</div>
            <h2 className="city">{weather.city}</h2>
            <p className="temperature">
              <Thermometer size={20} /> {weather.temperature}°C
            </p>
            <p className="wind">
              <Wind /> Wind: {weather.wind} km/h
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App