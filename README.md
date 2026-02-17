# Historical Weather Display for Finnish Cities
A web page that uses the Open-Meteo API to show historic weather data.

<p align="center">
  <img width="1903" height="918" alt="Screenshot from custom view" src="https://github.com/user-attachments/assets/9d0d673c-2ead-4830-b0fa-3b6fdcede3b0" />
</p>

## Usage

### <ins>Selecting parameters</ins>

In order to change the data displayed, the start and end dates, data type and city can be selected via drop-down menus:

<img width="502" height="130" alt="Parameter selectors" src="https://github.com/user-attachments/assets/b6f87692-38b3-45e0-a402-127c2feadda6" />

The currently available cities in the webpage are the Finnish regional capitals, more can be added in the options as the coordinates are obtained from Open-Meteo's geocoding API.

More data types can be added in the `index.html`, however, the function `getUnit(dataType)` in `script.js` will have to be modified to return the correct unit for the added data type.


### <ins>Reading the data</ins>
  
<img width="1904" height="752" alt="Image of chart with statistics" src="https://github.com/user-attachments/assets/73de47c6-1c7a-46c8-bf80-ccc68d6c5192" />

A chart is drawn in the middle of the screen using Chart.js with the `makeChart(labelValues, dataValues, dataType, unit)` function in `script.js`.

It is a line chart unless the data type is precipitation, in which case it changes to a bar chart.

The weather readings are drawn on the y-axis with time being displayed on the x-axis.

On the sides (or on the bottom of the screen while using a mobile display) are various statistics regarding the retrieved data, those being:
* Mean
* Range
* Median
* Amplitude
* Modes
* Standard Deviation
  
  
### <ins>Viewing the data table</ins>

All the retrieved data from Open-Meteo's weather API can be seen in the table displayed below the main view (accessed by scrolling):

<img width="478" height="738" alt="View of data table" src="https://github.com/user-attachments/assets/b6d80aa1-f5b5-41c3-a5b4-cd3f29664ffc" />


### <ins>Other views</ins>

<img width="1906" height="57" alt="Navbar" src="https://github.com/user-attachments/assets/ebd8bd08-d749-4593-8bbe-72403021ea92" />

Other views can be accessed using the navigation bar on the top of the page.

The default view is the custom view, in which it is possible to change the data type, starting and ending dates as well as city.

On the other views, the data type is pre-selected as well as the city (Tampere).

The time span can be selected via the selector drop-down menu:

<img width="438" height="75" alt="Time span selector" src="https://github.com/user-attachments/assets/f3dbadfe-560d-4e3d-b79a-267f14503b66" />

All other functionality remains the same.


## File structure

<p align="center">
  <img width="159" height="218" alt="File structure" src="https://github.com/user-attachments/assets/4991144e-9efd-48e4-9143-6e5e8074a5da" />
</p>

The custom view's structure is defined by `index.html`, whereas the humidity and precipitation views use `html/humidity.html` and `html/precipitation.html` respectively.

All pages use the stylesheet from `css/styles.css`.

The custom and secondary views use different JavaScript files due to differing parameter handling logic.

The custom view (`index.html`) uses `js/custom-view.js`, whereas the secondary views (`html/humidity.html`, `html/precipitation.html`) use `js/extra-views.js`.

Both JavaScript files import common functions and variables from `js/script.js`.
