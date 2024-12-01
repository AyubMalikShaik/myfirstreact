import React, { useState } from "react"; 
import Plot from "react-plotly.js";
import './WeatherApp.css';
import search_icon from "../Assets/search.png";
import cloud_icon from "../Assets/cloud.png";
import humidity_icon from "../Assets/humidity.png";
import wind_icon from "../Assets/wind.png";

const WeatherApp = () => {
  const [chartData, setChartData] = useState(null);
  const [pollutantDetails, setPollutantDetails] = useState(null);

  let api_key = "50648a4b9eaa8aeddc77f9e4b672c45d";

  const classifyPollutant = (value, ranges) => {
    if (value <= ranges.good) return "Good";
    if (value <= ranges.fair) return "Fair";
    if (value <= ranges.moderate) return "Moderate";
    if (value <= ranges.poor) return "Poor";
    return "Very Poor";
  };

  const search = async () => {
    const element = document.getElementsByClassName("cityInput");
    if (element[0].value === "") {
      return;
    }

    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${element[0].value}&appid=${api_key}`;
    let response = await fetch(url);
    let data = await response.json();
    let lon = data[0].lon;
    let lat = data[0].lat;

    let url2 = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
    let response2 = await fetch(url2);
    let data2 = await response2.json();
    const humidity = document.getElementsByClassName("humidity-percent");
    const wind = document.getElementsByClassName("wind-rate");
    const temparature = document.getElementsByClassName("weather-temp");
    const location = document.getElementsByClassName("weather-location");

    humidity[0].innerHTML = data2.list[0].components.co + " CO";
    wind[0].innerHTML = data2.list[0].components.no + " NO";
    temparature[0].innerHTML = data2.list[0].components.no2 + " NO2";
    location[0].innerHTML = data2.list[0].components.o3 + " O3";

    const components = data2.list[0].components;

    const ranges = {
      co: { good: 4400, fair: 9400, moderate: 12400, poor: 15400 },
      no: { good: 20, fair: 40, moderate: 70, poor: 150 },
      no2: { good: 40, fair: 70, moderate: 150, poor: 200 },
      o3: { good: 60, fair: 100, moderate: 140, poor: 180 },
      so2: { good: 20, fair: 80, moderate: 250, poor: 350 },
      pm2_5: { good: 10, fair: 25, moderate: 50, poor: 75 },
      pm10: { good: 20, fair: 50, moderate: 100, poor: 200 },
    };

    const labels = [];
    const values = [];
    const colors = [];
    const details = [];

    Object.keys(components).forEach((key) => {
      const value = components[key];
      const category = classifyPollutant(value, ranges[key] || {});
      labels.push(key.toUpperCase());
      values.push(value);
      details.push({ name: key.toUpperCase(), value, category });

      switch (category) {
        case "Good":
          colors.push("green");
          break;
        case "Fair":
          colors.push("blue");
          break;
        case "Moderate":
          colors.push("yellow");
          break;
        case "Poor":
          colors.push("orange");
          break;
        case "Very Poor":
          colors.push("red");
          break;
        default:
          colors.push("gray");
      }
    });

    setChartData({
      labels,
      values,
      colors,
    });

    setPollutantDetails(details);
  };

  return (
    <div className="container">
      <div className="top-bar">
        <input type="text" className="cityInput" placeholder="Search" />
        <div className="search-icon" onClick={() => search()}>
          <img src={search_icon} alt="Search" />
        </div>
      </div>
      <div className="horizontal-layout">
        <div className="weather-details">
          <div className="main-weather">
            <div className="weather-image">
              <img src={cloud_icon} alt="Weather" />
            </div>
            <div className="weather-info">
              <div className="weather-temp">24°C</div>
              <div className="weather-location">Location</div>
            </div>
          </div>
          <div className="data-container">
            <div className="element">
              <img src={humidity_icon} alt="Humidity" className="icon" />
              <div className="data">
                <div className="humidity-percent">64</div>
                <div className="text">Carbon Monoxide</div>
              </div>
            </div>
            <div className="element">
              <img src={wind_icon} alt="Wind Speed" className="icon" />
              <div className="data">
                <div className="wind-rate">18 km/h</div>
                <div className="text">Nitrogen Monoxide</div>
              </div>
            </div>
          </div>
        </div>
        <div className="chart-section">
          {chartData && (
            <div className="chart-container">
              <h3 className="chart-title">Pollutant Distribution</h3>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: chartData.labels,
                    values: chartData.values,
                    marker: {
                      colors: chartData.colors,
                    },
                  },
                ]}
                layout={{
                  title: "",
                  height: 300,
                  width: 400,
                }}
              />
            </div>
          )}
          {pollutantDetails && (
            <div className="legend-container" style={{ backgroundColor: "#f8f8f8", padding: "20px", borderRadius: "10px" }}>
              <h3 style={{ color: "darkblue", fontWeight: "bold" }}>Pollutant Details</h3>
              <ul>
                {pollutantDetails.map((detail, index) => (
                  <li key={index} style={{ fontSize: "16px", fontWeight: "600", color: detail.category === 'Good' ? 'green' : detail.category === 'Poor' ? 'red' : 'blue' }}>
                    <strong>{detail.name}</strong>: {detail.value} μg/m³ ({detail.category})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
