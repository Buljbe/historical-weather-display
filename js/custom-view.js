import * as Script from "./script.js";

async function fetchLocation(city) { // retrieves location data from open-meteo's geocoding API
    try {
        const params = new URLSearchParams ({
            name: city,
            count: 1,
            language: "en",
            format: "json"
        });

        const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
        const responses = await fetch(url);
        const data = await responses.json();

        const location = { // we only need the coordinates
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude
        };

        return (location);
    } catch (error) {
        console.error(`Error obtaining location data: ${error}`);
    }
}

async function fetchData(latitude, longitude, startDate, endDate, dataType) { // tries to retrieve data from open-meteo
    try {
        const params = new URLSearchParams ({
            latitude: latitude,
            longitude: longitude,
            hourly: dataType,
            timezone: "auto",
            start_date: startDate,
            end_date: endDate
        });
        
        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const responses = await fetch(url);
        const data = await responses.json();
        
        data.hourly.time = data.hourly.time.map(time => time.slice(0, 10) + " " + time.slice(11)); // cleans up the strings so that there is no "T" in the middle
        return (data.hourly); // we only need the hourly data
    } catch (error) {
        console.error(`Error obtaining weather data: ${error}`);
    }
}

async function updatePage(city, startDate, endDate, dataType) { // tries to obtain data from open-meteo, update the stats and make the chart
    try {
        const location = await fetchLocation(city);
        const data = await fetchData(location.latitude, location.longitude, startDate, endDate, dataType);
        const unit = Script.getUnit(dataType);
        Script.updateStats(data, dataType, unit);
        Script.makeChart(data.time, data[dataType], dataType, unit);
        Script.makeTable(data.time, data[dataType], unit);
    }
    catch (e) {
        console.error("Error updating weather info:", e);
    }
}

function daysFromNow(days) { // return the inputted amount of days added to the current date
    let date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
}

async function main() {
    let city = "Helsinki";
    let startDate = daysFromNow(-7);
    let endDate = daysFromNow(0);
    let dataType = "temperature_2m";

    const citySelect = document.getElementById("city-select"); // element for inputting the city
    const startDateSelect = document.getElementById("start-select"); // element for inputting the start date
    const endDateSelect = document.getElementById("end-select"); // element for inputting the end date
    const dataSelect = document.getElementById("data-select"); // element for inputting the data type

    /*
    ---------------
    CITY SELECTION
    ---------------
    */
    citySelect.addEventListener("change", (event) => {
        city = event.target.value;
        Script.chartObj.destroy();
        updatePage(city, startDate, endDate, dataType);
    });

    /*
    ---------------
    TIME SELECTION
    ---------------
    */
    startDateSelect.value = startDate;
    endDateSelect.value = endDate;

    let daysBefore = -60; // 2 months before now
    let daysAfter = 15; // 2 weeks after now

    // clicking the date input opens the calendar
    startDateSelect.addEventListener("click", () => {
        startDateSelect.showPicker();
    });
    endDateSelect.addEventListener("click", () => {
        endDateSelect.showPicker();
    });

    startDateSelect.addEventListener("change", (event) => {
        startDate = event.target.value;
        endDateSelect.min = startDate; // you cannot select an end date that comes before the start date
        Script.chartObj.destroy();
        updatePage(city, startDate, endDate, dataType);
    });

    endDateSelect.addEventListener("change", (event) => {
        endDate = event.target.value;
        startDateSelect.max = endDate; // you cannot select a start date that comes after the end date
        Script.chartObj.destroy();
        updatePage(city, startDate, endDate, dataType);
    });

    let minDate = daysFromNow(daysBefore);
    let maxDate = daysFromNow(daysAfter);

    startDateSelect.min = minDate;
    endDateSelect.min = startDate;
    startDateSelect.max = endDate;
    endDateSelect.max = maxDate;

    /*
    ---------------
    DATA SELECTION
    ---------------
    */
    dataSelect.addEventListener("change", (event) => {
        dataType = event.target.value;
        Script.chartObj.destroy();
        updatePage(city, startDate, endDate, dataType);
    });

    updatePage(city, startDate, endDate, dataType);


}

main();