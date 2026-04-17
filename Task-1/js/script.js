async function searchWeather() {
  const city = document.getElementById('cityInput').value.trim();
  const errorDiv = document.getElementById('error');
  const card = document.getElementById('weatherCard');

  if (!city) {
    errorDiv.textContent = "Please enter a city name";
    errorDiv.classList.remove('hidden');
    return;
  }

  errorDiv.classList.add('hidden');
  card.classList.add('hidden');

  try {
    // 1. Get coordinates
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Get weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;

    // Update UI
    document.getElementById('cityName').textContent = `${name}, ${country || ''}`;
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
    document.getElementById('currentTemp').innerHTML = `${Math.round(current.temperature)}°<span class="text-4xl">C</span>`;
    document.getElementById('condition').textContent = getWeatherDescription(current.weathercode);
    document.getElementById('wind').textContent = `${current.windspeed} km/h`;
    document.getElementById('humidity').textContent = "N/A"; // Open-Meteo current doesn't have humidity, can extend later
    document.getElementById('visibility').textContent = "10 km";

    // Weather icon (using open source icons)
    const iconCode = getWeatherIcon(current.weathercode);
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    card.classList.remove('hidden');
  } catch (err) {
    errorDiv.textContent = err.message || "Failed to fetch weather";
    errorDiv.classList.remove('hidden');
  }
}

function getWeatherDescription(code) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    51: "Light drizzle",
    61: "Rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm"
  };
  return codes[code] || "Unknown";
}

function getWeatherIcon(code) {
  // Simple mapping to OpenWeather icons (works well)
  if (code === 0) return "01d";
  if ([1,2,3].includes(code)) return "02d";
  if (code >= 45 && code <= 48) return "50d";
  if (code >= 51 && code <= 67) return "09d";
  if (code >= 71 && code <= 77) return "13d";
  if (code >= 80 && code <= 82) return "09d";
  if (code >= 95) return "11d";
  return "02d";
}

// Allow Enter key
document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchWeather();
});

// Load default city (Mumbai)
window.onload = () => {
  document.getElementById('cityInput').value = "Mumbai";
  searchWeather();
};