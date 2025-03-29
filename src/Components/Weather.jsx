import React, { useEffect, useRef, useState } from 'react';
import search_icon from '../assets/search.png';
import moon_icon from '../assets/moon.png';
import sun_icon from '../assets/sunny.png';
import humidity_icon from '../assets/humidity.png';
import wind_icon from '../assets/wind.png';
import windLight from '../assets/windLight.png';
import humidityLight from '../assets/humidityLight.png';
import refresh from '../assets/refresh.png';


const Weather = () => {
    const inputRef = useRef();
    const [weatherData, setWeatherData] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const [fiveDayForecast, setFiveDayForecast] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [message, setMessage] = useState("");

    const getTime = (timestamp, timezoneOffset) => {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const getDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
    };

    const search = async (city) => {
        try {
            if (!city.trim()) {
                setMessage("Please enter a city name.");
                setWeatherData(null);
                return;
            }

            setMessage("Fetching weather data...");

            const apiKey = import.meta.env.VITE_APP_ID;
            if (!apiKey) {
                console.error("API Key is missing!");
                setMessage("API Key is missing!");
                return;
            }

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl),
            ]);

            if (!weatherResponse.ok) {
                setMessage("City not found. Please enter a valid location.");
                setWeatherData(null);
                setHourlyData([]);
                setFiveDayForecast([]);
                return;
            }

            if (!forecastResponse.ok) {
                setMessage("Error fetching forecast data.");
                return;
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

            setWeatherData({
                city: weatherData.name,
                temperature: Math.floor(weatherData.main.temp),
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                weatherCondition: weatherData.weather[0].description,
                weatherIcon: weatherIconUrl,
            });

            const hourlyForecast = forecastData.list.slice(0, 5).map((entry) => ({
                time: getTime(entry.dt, forecastData.city.timezone),
                temperature: Math.floor(entry.main.temp),
                icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`
            }));
            setHourlyData(hourlyForecast);

            const dailyForecast = [];
            const uniqueDays = new Set();
            forecastData.list.forEach((entry) => {
                const dateStr = getDate(entry.dt);
                if (!uniqueDays.has(dateStr) && entry.dt_txt.includes("12:00:00")) {
                    uniqueDays.add(dateStr);
                    dailyForecast.push({
                        date: dateStr,
                        minTemp: Math.floor(entry.main.temp_min),
                        maxTemp: Math.floor(entry.main.temp_max),
                        icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`
                    });
                }
            });

            setFiveDayForecast(dailyForecast.slice(0, 5));
            setMessage("");
        } catch (error) {
            console.error("Error fetching weather data:", error);
            setMessage("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        search("Tirupati");
    }, []);
    

    return (
        <div className={`flex justify-center items-center min-h-screen transition-all duration-300 
            ${darkMode ? 'bg-gray-900 text-white' : 'bg-blue-500 text-gray-800'}`}>

            <button 
                className="absolute top-6 right-6 flex items-center gap-2 p-2 rounded-full shadow-lg bg-white 
                hover:bg-gray-200 transition-all duration-300"
                onClick={() => setDarkMode(!darkMode)}
            >
                <img src={darkMode ? sun_icon : moon_icon} alt="Toggle" className="w-6" />
            </button>

            <div className={`flex gap-6 items-center p-6 rounded-2xl shadow-lg w-[950px] transition-all duration-300
                ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>

                <div className="w-[350px] flex flex-col items-center">
                    <div className="flex items-center gap-3 w-full mb-4">
                        <input 
                            ref={inputRef} 
                            className={`flex-1 border rounded-full p-3 outline-none focus:ring-2 
                                transition-all duration-300 ${darkMode ? 'bg-gray-700 text-white border-gray-500' : 'border-gray-400 text-gray-800'}`}
                            placeholder="Enter city name..."
                            onKeyDown={(e) => e.key === 'Enter' && search(inputRef.current.value)}
                        />
                        <img 
                            src={search_icon} 
                            alt="Search" 
                            className="w-10 p-2 cursor-pointer bg-indigo-500 rounded-full hover:bg-indigo-700 transition"
                            onClick={() => search(inputRef.current.value)}
                        />
                        {/*  */}
                        <img 
                            src={refresh} 
                            alt="Refresh" 
                            className="w-10 p-2 cursor-pointer bg-green-500 rounded-full hover:bg-green-700 transition"
                            onClick={() => search(currentCity)} 
                        />
                    </div>

                    {message && <p className="text-red-500 font-medium">{message}</p>}

                    {weatherData ? (
                        <>
                            <img src={weatherData.weatherIcon} alt="Weather Icon" className="w-24 mb-2" />
                            <p className="text-4xl font-bold">{weatherData.temperature}°C</p>
                            <p className="text-lg capitalize">{weatherData.weatherCondition}</p>
                            <p className="text-xl font-medium mt-2">{weatherData.city}</p>
                            <div className="flex gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <img src={darkMode ? humidity_icon : humidityLight} alt="Humidity" className="w-6" />
                                    <p>{weatherData.humidity}%</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src={darkMode ? wind_icon : windLight} alt="Wind Speed" className="w-6" />
                                    <p>{weatherData.windSpeed} m/s</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>

                <div className="w-[350px] flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">Hourly Forecast</h2>
                    <div className="flex gap-3">
                        {hourlyData.map((hour, index) => (
                            <div key={index} className="text-center">
                                <p>{hour.time}</p>
                                <img src={hour.icon} alt="Weather" className="w-10" />
                                <p>{hour.temperature}°C</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-[350px] flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-2">5-Day Forecast</h2>
                    <div className="flex flex-col gap-2">
                        {fiveDayForecast.map((day, index) => (
                            <div key={index} className="flex items-center justify-between w-full px-4 py-2 rounded-lg bg-gray-200">
                                <p className='text-gray-500'>{day.date}</p>
                                <img src={day.icon} alt="Weather" className="w-8" />
                                <p className='text-gray-500'>{day.minTemp}°C / {day.maxTemp}°C</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Weather;
