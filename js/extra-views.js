import * as Script from "./script.js";

async function fetchData(timeSpan, dataType) { // tries to retrieve data from open-meteo
    try {
        const params = new URLSearchParams ({
            latitude: 61.4991,
            longitude: 23.7871,
            hourly: dataType,
            timezone: "auto",
            past_days: (timeSpan == 20) ? 1 : timeSpan, // for convenience with the values, 20 is still used but only asks for the past day (since it is the last 20 hours), all other arguments ask for days so they just use their own value
            forecast_days: 1,
        });
        
        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const responses = await fetch(url);
        const data = await responses.json();

        return (data.hourly); // we only need the hourly data
    } catch (error) {
        console.error(error);
    }
}

async function getWeather(timeSpan, dataType) { // retrieves data and formats it to have only the required amount
    const date = new Date();
    const now = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 14) + "00";

    let entries = (timeSpan == 20) ? 20 : timeSpan*24; // how many hours to show before the current time (inclusive)
    const data = await fetchData(timeSpan, dataType);

    const lastIndex = data.time.indexOf(now)+1; // the index after the current time, used in the slice
    const weather = { // makes an object that contains the amount of entries the user specifies up until the current time
        time: data.time.slice(lastIndex-entries, lastIndex),
        [dataType]: data[dataType].slice(lastIndex-entries, lastIndex)
    };
    weather.time = weather.time.map(time => time.slice(0, 10) + " " + time.slice(11)); // cleans up the strings so that there is no "T" in the middle
    return weather;
}

async function updatePage(timeSpan, dataType) { // tries to obtain data from open-meteo, update the stats and make the chart
    try {
        const data = await getWeather(timeSpan, dataType);
        const unit = Script.getUnit(dataType);
        Script.updateStats(data, dataType, unit);
        Script.makeChart(data.time, data[dataType], dataType, unit);
        Script.makeTable(data.time, data[dataType], unit);
    }
    catch (e) {
        console.error("Error updating weather info:", e);
    }
}

async function main() {
    let timeSpan = 20;
    let dataType;

    switch (window.location.pathname) { // different default data type depending on page
        case "/html/humidity.html":
            dataType = "relative_humidity_2m";
            break;
        case "/html/precipitation.html":
            dataType = "precipitation";
            break;
        default:
            dataType = "temperature_2m";
    }
    
    const timeSelect = document.getElementById("time-select"); // element for inputting the time span on view 2 and 3

    timeSelect.addEventListener("change", (event) => {
        timeSpan = event.target.value;
        Script.chartObj.destroy();
        updatePage(timeSpan, dataType);
    });

    updatePage(timeSpan, dataType);
}

main();