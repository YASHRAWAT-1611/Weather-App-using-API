// 1. Configuration
const API_KEY = "dQeQlxITBPRdj9lWC19Y5gR35UkDyZjw"; 
const API_BASE_URL = "https://api.tomorrow.io//v4/timelines";

// 2. DOM Elements
const locationNameEl = document.getElementById('location-name');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const weatherIconEl = document.getElementById('weather-icon');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const hourlyForecastEl = document.getElementById('hourly-forecast');
const errorMessageEl = document.getElementById('error-message');

// --- Tomorrow.io Helper Data ---

// Lookup table for weather descriptions and general icon categories
const WEATHER_CODE_MAP = {
    1000: { text: "Clear", iconCategory: "clear" },
    1100: { text: "Mostly Clear", iconCategory: "clear" },
    1101: { text: "Partly Cloudy", iconCategory: "partly-cloudy" },
    1102: { text: "Mostly Cloudy", iconCategory: "partly-cloudy" },
    1001: { text: "Cloudy", iconCategory: "cloudy" },
    2000: { text: "Fog", iconCategory: "cloudy" },
    2100: { text: "Light Fog", iconCategory: "cloudy" },
    4000: { text: "Drizzle", iconCategory: "rain" },
    4001: { text: "Rain", iconCategory: "rain" },
    4200: { text: "Light Rain", iconCategory: "rain" },
    4201: { text: "Heavy Rain", iconCategory: "rain" },
    5000: { text: "Snow", iconCategory: "snow" },
    5001: { text: "Flurries", iconCategory: "snow" },
    5100: { text: "Light Snow", iconCategory: "snow" },
    5101: { text: "Heavy Snow", iconCategory: "snow" },
    6000: { text: "Freezing Drizzle", iconCategory: "sleet" },
    6001: { text: "Freezing Rain", iconCategory: "sleet" },
    6200: { text: "Light Freezing Rain", iconCategory: "sleet" },
    6201: { text: "Heavy Freezing Rain", iconCategory: "sleet" },
    7000: { text: "Ice Pellets", iconCategory: "sleet" },
    7101: { text: "Heavy Ice Pellets", iconCategory: "sleet" },
    7102: { text: "Light Ice Pellets", iconCategory: "sleet" },
    8000: { text: "Thunderstorm", iconCategory: "thunderstorm" },
};

/**
 * Maps the Tomorrow.io weather code to an icon file name (simple implementation).
 * @param {number} code - The weatherCode value.
 * @param {boolean} isDay - True if it's daytime, false otherwise.
 * @returns {string} - The path to a simple, illustrative icon (You can replace these with your own images).
 */
function getWeatherIcon(code, isDay) {
    const defaultIcon = isDay ? '☀️' : '🌙'; // Default clear/night icons
    
    if (!WEATHER_CODE_MAP[code]) {
        return defaultIcon;
    }
    
    const category = WEATHER_CODE_MAP[code].iconCategory;
    
    // A more realistic implementation would use images based on category and time:
    // This is a simple emoji placeholder, but you can link real images here.
    switch (category) {
        case 'clear':
            return isDay ? '☀️' : '🌙';
        case 'partly-cloudy':
            return isDay ? '🌤️' : '☁️';
        case 'cloudy':
            return '☁️';
        case 'rain':
            return '🌧️';
        case 'snow':
            return '❄️';
        case 'sleet':
            return '🌨️';
        case 'thunderstorm':
            return '⛈️';
        default:
            return defaultIcon;
    }
}

// --- Helper Functions ---

/**
 * Rounds the temperature to the nearest whole number and adds the Celsius symbol.
 * Tomorrow.io returns Celsius by default, which is simpler than Kelvin conversion.
 * @param {number} temp - Temperature in Celsius.
 * @returns {string} - Temperature string with degree symbol.
 */
const formatTemp = (temp) => `${Math.round(temp)}°C`;

// --- Core Logic ---

/**
 * Updates the UI with the current weather data.
 * @param {object} currentData - The current weather object from the API response.
 * @param {string} location - The name of the city/location.
 */
function displayCurrentWeather(currentData, isDaytime, location) {
    const values = currentData.values;
    const weatherCode = values.weatherCode;
    const weatherDescription = WEATHER_CODE_MAP[weatherCode] ? WEATHER_CODE_MAP[weatherCode].text : "Unknown";
    
    locationNameEl.textContent = location;
    temperatureEl.textContent = formatTemp(values.temperature);
    descriptionEl.textContent = weatherDescription;
    humidityEl.textContent = `${Math.round(values.humidity)}%`;
    windSpeedEl.textContent = `${(values.windSpeed * 3.6).toFixed(1)} km/h`; // m/s to km/h

    // Simple icon placeholder, replace with an <img> tag if you use image assets
    weatherIconEl.outerHTML = `<span id="weather-icon" class="icon" role="img" aria-label="${weatherDescription}">${getWeatherIcon(weatherCode, isDaytime)}</span>`;
}

/**
 * Populates the hourly forecast section.
 * @param {Array<object>} hourlyData - The array of hourly forecast objects.
 */
function displayHourlyForecast(hourlyData) {
    hourlyForecastEl.innerHTML = ''; // Clear previous content

    // We use the next 12 hours starting from the first interval (which is usually the next hour)
    const next12Hours = hourlyData.slice(1, 13); 

    next12Hours.forEach(hour => {
        const time = new Date(hour.startTime);
        const hourDisplay = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        
        const temp = hour.values.temperature;
        const weatherCode = hour.values.weatherCode;

        // A simple way to guess if it's day or night for icon selection
        const hourOfDay = time.getHours();
        const isDaytime = hourOfDay > 6 && hourOfDay < 18; 
        
        const weatherIcon = getWeatherIcon(weatherCode, isDaytime);
        
        const item = document.createElement('div');
        item.classList.add('hourly-item');
        
        // Note: We use the simple icon placeholder from the getWeatherIcon function
        item.innerHTML = `
            <p class="hourly-time">${hourDisplay}</p>
            <span class="icon">${weatherIcon}</span>
            <p class="hourly-temp">${formatTemp(temp)}</p>
        `;
        hourlyForecastEl.appendChild(item);
    });
}

/**
 * Fetches the weather data from the Tomorrow.io API.
 * @param {number} lat - Latitude of the location.
 * @param {number} lon - Longitude of the location.
 */
async function getWeatherData(lat, lon) {
    try {
        // ... (other code)
        
        // Data fields we need for the current and hourly forecast
        const fields = [
            "temperature", 
            "weatherCode", 
            "humidity", 
            "windSpeed", 
            //"isDaylight"
        ].join(',');

        // Requesting "current" and "1h" (hourly) timesteps
        const timesteps = "current,1h";

        // *************************************************************
        // 🎯 CRITICAL FIX: Ensure location format is correct (lat,lon)
        // *************************************************************
        const location_coords = `${lat},${lon}`;
        
        // Construct the correct API URL
        const url = `${API_BASE_URL}?location=${location_coords}&fields=${fields}&timesteps=${timesteps}&units=metric&apikey=${API_KEY}`;
        // *************************************************************
        
        const response = await fetch(url);

        if (!response.ok) {
            // Tomorrow.io returns meaningful errors in the body
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        // Tomorrow.io Data Structure:
        // data.data.timelines is an array with entries for each timestep (current, 1h)
        const currentTimeline = data.data.timelines.find(t => t.timestep === 'current');
        const hourlyTimeline = data.data.timelines.find(t => t.timestep === '1h');
        
        if (!currentTimeline || !hourlyTimeline) {
            throw new Error("Missing current or hourly data in API response.");
        }

        const currentData = currentTimeline.intervals[0];
        
        // We must now calculate if it's daytime since the field is gone.
        const currentTime = new Date(currentData.startTime);
        const currentHour = currentTime.getHours();
        const isDaytime = currentHour >= 7 && currentHour < 19; 

        // CRITICAL FIX: Define the locationDisplay variable here!
        // We are using latitude and longitude as the location name since we don't 
        // have a dedicated geocoding API call set up.
        const locationDisplay = `Latitude: ${lat.toFixed(2)}, Longitude: ${lon.toFixed(2)}`;

        // 2. Display the data (This is the line causing the error)
        displayCurrentWeather(currentData, isDaytime, locationDisplay);
        displayHourlyForecast(hourlyTimeline.intervals);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        errorMessageEl.textContent = "Could not fetch weather data. Please check your API key or the console for details.";
    }
}


/**
 * Gets the user's current location using the Geolocation API.
 * (This function remains the same as it uses the browser's built-in feature)
 */
function getLocation() {
    locationNameEl.textContent = "Fetching Location...";
    if (navigator.geolocation) {
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: 5000, 
            maximumAge: 0
        };

        const success = (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherData(lat, lon);
        };

        const error = (err) => {
            console.warn(`Geolocation error (${err.code}): ${err.message}`);
            locationNameEl.textContent = "Location Access Denied";
            errorMessageEl.textContent = "Geolocation failed. Please allow location access and refresh to see the weather.";
        };

        navigator.geolocation.getCurrentPosition(success, error, geoOptions);
    } else {
        locationNameEl.textContent = "Error";
        errorMessageEl.textContent = "Geolocation is not supported by this browser.";
    }
}

// 4. Start the app
getLocation();