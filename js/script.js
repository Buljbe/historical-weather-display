let chartObj; // the chart is stored here, declared outside of functions because updatePage() needs to be able to destroy it and makeChart() needs to be able to make it

async function fetchData(startDate, endDate, dataType) { // tries to retrieve data from open-meteo
    try {
        const params = new URLSearchParams ({
            latitude: 61.4991,
            longitude: 23.7871,
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
        console.error(error);
    }
}

async function makeChart(labelValues, dataValues, dataType, unit) { // makes the chart object with chart.js
    const ctx = document.getElementById('chart');
    const dividor = (dataValues.length/(24))*(2); // used to have only a small amount of ticks be visible, to keep the chart readable
    const chartType = (dataType == "precipitation") ? "bar" : "line"; // uses a bar graph if displaying precipitation


    chartObj = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labelValues,
            datasets: [{
                label: dataType,
                data: dataValues,
                borderWidth: 1
            }]
        },
        options: {
            interaction: {
                mode: 'index',      // triggers tooltip based on where cursor is horizontally (based on the index)
                intersect: false    // shows tooltip without directy hovering overp point
            },
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date and Time (Hourly)",
                        align: "bottom"
                    },
                    ticks: {
                        autoSkip: false,
                        callback: function(index) {
                            return index % dividor == 0 ? this.getLabelForValue(index) : ''; // Make it so that there are only 4 labels
                        }
                    }, 
                    grid: {
                        color: function(context) {
                            // Only show grid line for every tick with a label
                            return context.index % dividor == 0
                                ? "rgba(0,0,0,0.1)"
                                : "transparent";
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `${dataType}, ${unit}`,
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                display: false
                }
            }
        }
    });
}

function updateStats(weather, dataType, unit) { // updates the statistics bars' info
    const values = weather[dataType];
    const mean = getMean(values);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const median = getMedian(values);
    const stdDev = getStandardDeviation(values, mean);

    document.getElementById("mean").textContent = `Mean:\n${round(mean, 1)}${unit}`;
    document.getElementById("range").textContent = `Range:\n${min}${unit} to ${max}${unit}`;
    document.getElementById("median").textContent = `Median:\n${round(median, 1)}${unit}`;

    document.getElementById("amplitude").textContent = `Amplitude:\n${round((max - min), 1)}${unit}`;
    document.getElementById("modes").textContent = `Modes:\n${getModes(values, unit)}`;
    document.getElementById("std-dev").textContent = `Std Dev:\n${round(stdDev, 1)}${unit}`;
}

function round(value, precision) { // rounds a number, the 2nd argument specifies how many values past the decimal point to keep
    let multiplier = Math.pow(10, precision || 0);
    return Math.round(((value * multiplier) - 1e-4)) / multiplier; // adds a magic number (1e-4) otherwise due to floating point precision a value like 0.5 gets rounded to 0 instead of 1
}

function getMean(arr) { // returns the mean of the values from an array
    return (arr.reduce((a, b) => a + b) / arr.length);
}

function getMedian(arr) { // returns the median of the values from an array
    let sorted = [...arr].sort((a, b) => a - b); // uses an arrow function to return integers instead of the default strings
    let length = sorted.length;

    if (length % 2 == 1) {
        return sorted[(length / 2) - 0.5];
    } else {
        return (sorted[length / 2] + sorted[(length / 2) - 1]) / 2;
    }
}

function getModes(arr, unit) { // returns the modes of the values from an array
    const frequencyMap = {};

    arr.forEach(number => {
        frequencyMap[number] =
            (frequencyMap[number] || 0) + 1;
    });

    let modes = "";
    let maxFrequency = 0;
    let counter = 0;

    for (const number in frequencyMap) {
        const frequency = frequencyMap[number];
        if (frequency >= maxFrequency) {
            if (frequency > maxFrequency) {
                maxFrequency = frequency;
                modes = `${number}${unit}`;
                counter = 0;
            } else if (frequency == maxFrequency) {
                modes += `, `;
                if (counter == 2) { // makes it so that the values are not all in one line
                    modes += "\n";
                    counter = 0;
                }
                modes += `${number}${unit}`;
            }
            
            counter++;
        }

    }
    return modes;
}

function getStandardDeviation(arr, mean) { // returns the standard deviation of the values from an array
    return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / arr.length)
}

function getUnit (dataType) { // returns the appropriate unit for a selection of data types
    switch(dataType) {
        case "relative_humidity_2m":
            return "%";
        case "temperature_2m":
        case "dew_point_2m":
        case "apparent_temperature":
            return "°C";
        case "precipitation":
            return " ml";
        case "surface_pressure":
            return " hPa";
        case "wind_speed_10m":
            return " km/h";
    }
}

async function updatePage(startDate, endDate, dataType) { // tries to obtain data from open-meteo, update the stats and make the chart
    try {
        const data = await fetchData(startDate, endDate, dataType);
        const unit = getUnit(dataType);
        updateStats(data, dataType, unit);
        makeChart(data.time, data[dataType], dataType, unit);
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
    let startDate = daysFromNow(-7);
    let endDate = daysFromNow(0);
    let dataType = "temperature_2m";

    const startDateSelect = document.getElementById("start-select"); // element for inputting the start date on view 1 (custom)
    const endDateSelect = document.getElementById("end-select"); // element for inputting the end date on view 1 (custom)
    const dataSelect = document.getElementById("data-select"); // element for inputting the data type on view (custom)  

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
        chartObj.destroy();
        updatePage(startDate, endDate, dataType);
    });

    endDateSelect.addEventListener("change", (event) => {
        endDate = event.target.value;
        startDateSelect.max = endDate; // you cannot select a start date that comes after the end date
        chartObj.destroy();
        updatePage(startDate, endDate, dataType);
    });

    let minDate = daysFromNow(daysBefore);
    let maxDate = daysFromNow(daysAfter);

    startDateSelect.min = minDate;
    endDateSelect.min = startDate;
    startDateSelect.max = endDate;
    endDateSelect.max = maxDate;

    dataSelect.addEventListener("change", (event) => {
        dataType = event.target.value;
        chartObj.destroy();
        updatePage(startDate, endDate, dataType);
    });

    updatePage(startDate, endDate, dataType);


}

main();