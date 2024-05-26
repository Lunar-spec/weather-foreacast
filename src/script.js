const weatherDiv = document.getElementById("weather");
const forecastDiv = document.getElementById("forecast");
const recentSearchesDiv = document.getElementById("recentSearches");
const API_KEY = "bd0276a7ae15fdd2ef3b9875274bf310";
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    showFetchingMessage();
    const city = document.getElementById("city").value;
    if (city) {
        fetchWeatherByCity(city);
    }
});

document.getElementById("currentLocation").addEventListener("click", () => {
    showFetchingMessage();
    fetchWeatherByCurrentLocation();
});

const showFetchingMessage = () => {
    weatherDiv.innerHTML = `
        <div class="flex flex-1 items-center justify-center flex-col text-2xl font-semibold gap-2">
            <p>Fetching...</p>
        </div>
    `;
    forecastDiv.innerHTML = ""; // Clear forecast while fetching new data
};

const fetchWeatherByCity = async (city) => {
    // Fetch weather and forecast data of the given city
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const weatherResponse = await fetch(apiUrl);
        const forecastResponse = await fetch(forecastUrl);
        if (!weatherResponse.ok) throw new Error("City not found");
        if (!forecastResponse.ok) throw new Error("Forecast not found");
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        displayWeather(weatherData);
        displayForecast(forecastData);
        saveRecentSearch(city);
    } catch (error) {
        console.log(error);
        displayError(error.message);
    }
};

const fetchWeatherByCurrentLocation = () => {
    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                // Fetch weather and forecast data of the current location
                try {
                    const weatherResponse = await fetch(apiUrl);
                    const forecastResponse = await fetch(forecastUrl);
                    if (!weatherResponse.ok) throw new Error("Location not found");
                    if (!forecastResponse.ok) throw new Error("Forecast not found");
                    const weatherData = await weatherResponse.json();
                    const forecastData = await forecastResponse.json();
                    displayWeather(weatherData);
                    displayForecast(forecastData);
                } catch (error) {
                    console.log(error);
                    displayError(error.message);
                }
            },
            () => {
                displayError("Unable to retrieve your location");
            }
        );
    } else {
        displayError("Geolocation is not supported by your browser");
    }
};

const displayWeather = (data) => {
    // Displaying the data from the API
    weatherDiv.innerHTML = `
    <div class="flex flex-1 flex-col justify-between items-center gap-2">
    <h2 class="text-4xl font-bold">${data.name}</h2>
    <div class="flex md:justify-between justify-center gap-4 items-center w-full md:px-16">
        <div class="flex md:flex-row flex-col items-center gap-4">
            <div class="flex flex-col items-center">
                <img
                    src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
                    alt="${data.weather[0].description}"
                >
                <h3 class="text-xl">${data.weather[0].main}</h3>
            </div>
            <h2 class="text-2xl font-semibold">${data.main.temp}°C</h2>
        </div>
        <div class="flex items-start justify-between w-1/2 flex-col md:flex-row">
            <div class="flex gap-2 justify-start items-start flex-col">
                <p>
                    <span><i class="fa-regular fa-face-laugh-beam"></i></span>
                    Feels like ${data.main.feels_like}°C
                </p>
                <p>
                    <span><i class="fa-solid fa-temperature-low"></i></span>
                    Min Temp: ${data.main.temp_min}°C
                </p>
                <p>
                    <span><i class="fa-solid fa-temperature-high"></i></span>
                    Max Temp: ${data.main.temp_max}°C
                </p>
            </div>
            <div class="flex gap-2 justify-start items-start flex-col">
                <p class="flex gap-2">
                    <span><i class="fa-solid fa-droplet"></i></span>
                    Humidity: ${data.main.humidity}%
                </p>
                <p class="flex gap-2">
                    <span><i class="fa-solid fa-arrows-to-circle"></i></span>
                    Pressure: ${data.main.pressure} hPa
                </p>
                <p class="flex gap-2">
                    <span><i class="fa-solid fa-wind"></i></span>
                    Wind Speed: ${data.wind.speed} m/s
                </p>
            </div>
        </div>
    </div>
</div>
    `;
};

const displayForecast = (data) => {
    console.log(data);
    // Displaying the fetched forecast data
    forecastDiv.innerHTML = `   
    <p class="text-2xl font-bold text-center">Forecast</p>
    <p class="text-center pb-2">For 5 days</p>
        <div class="forecast-container w-full overflow-x-auto">
            ${data.list
            .filter((item) => item.dt_txt.includes("12:00:00"))
            .map((forecast) => {
                const date = new Date(forecast.dt * 1000);
                return `
                <div class="forecast-card px-4 py-2 rounded">
                <h3 class="text-lg text-nowrap font-bold text-center w-full">${date.toDateString()}</h3>
                <p class="capitalize flex gap-2"><span><i class="fa-solid fa-cloud-sun"></i></span>${forecast.weather[0].description}</p>
                <p class="flex gap-2"><span><i class="fa-solid fa-temperature-three-quarters"></i></span>Temp:
                    ${forecast.main.temp}°C</p>
                <p class="flex gap-2"><span><i class="fa-solid fa-wind"></i></span>Wind: ${forecast.wind.speed} m/s</p>
                <p class="flex gap-2"><span><i class="fa-solid fa-droplet"></i></span>Humidity: ${forecast.main.humidity}%</p>
                <p class="flex gap-2"><span><i class="fa-solid fa-arrows-to-circle"></i></span>Pressure: ${forecast.main.pressure} hPa
                </p>
            </div>
                    `;
            })
            .join("")}
        </div>
    `;
};

const displayError = (message) => {
    weatherDiv.innerHTML = `
        <div class="text-white text-center w-full font-semibold text-2xl">
            <p>${message}</p>
        </div>
    `;
    forecastDiv.innerHTML = ""; // Clear forecast when there's an error
};

const saveRecentSearch = (city) => {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        if (recentSearches.length > 5) {
            recentSearches.shift(); // Keep only the last 5 searches
        }
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        displayRecentSearches();
    }
};

const displayRecentSearches = () => {
    recentSearchesDiv.innerHTML = recentSearches
        .map(city => `<button class="bg-white/20 px-2 py-1 rounded-full cursor-pointer text-sm recent-city-btn">${city}</button>`)
        .join(" ");
    document.querySelectorAll(".recent-city-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const city = e.target.innerText;
            document.getElementById("city").value = city;
            showFetchingMessage();
            fetchWeatherByCity(city);
        });
    });
};

displayRecentSearches(); // Initial call to display recent searches on page load
