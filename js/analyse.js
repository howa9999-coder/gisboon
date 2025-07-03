//=================================================== AddMarker FUNCTION
function addMarker(latA, lngA, color, id) {
    marker = L.circleMarker([latA, lngA], {
        color: color,
        radius: 8,
        fillColor: color,
        fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`
        <div>
            <p>Start Point: (${latA}, ${lngA})</p>
            <!-- <button id="${id}">Delete</button> -->
        </div>
    `);
        // Add event listener when the popup opens
/*     marker.on('popupopen', function (e) {
        const popupContent = e.popup.getElement();
        const deleteButton = popupContent.querySelector(`#${id}`);
        if (deleteButton) {
            deleteButton.addEventListener('click', function () {
                map.removeLayer(marker);  // Remove the marker
            });
        }
    }); */

}

/****************************************************************************************************************
 * **************************************************SEARCH POINT***********************************************************
 * ************************************************************************************************************** */ 

document.querySelector('#search-point').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat').value);
    const lng = parseFloat(document.querySelector('#lng').value);
    let point
    // Add a marker
addMarker(lat, lng, 'blue', 'searchPoint')
    // Set the view to the marker's location
    map.setView([lat, lng], 13); // Adjust zoom level as needed
});


/****************************************************************************************************************
 * **************************************************DISTINATION POINT***********************************************************
 * ************************************************************************************************************** */

const lat = document.querySelector('#lat-start');
const lng = document.querySelector('#log-start');
const bearingInput = document.querySelector('#bearing');
const distanceInput = document.querySelector('#distance');
const unitOption = document.querySelector('#unit');
const destinationResult = document.querySelector("#destination-result")
let start, end;

document.querySelector('#destination-point').addEventListener("click", function () {
    var point = turf.point([parseFloat(lng.value), parseFloat(lat.value)]); // Use longitude first in Turf.js
    var distance = parseFloat(distanceInput.value);
    var bearing = parseFloat(bearingInput.value);
    var options = { units: `${unitOption.value}` };
    var destination = turf.destination(point, distance, bearing, options);

    // Add start marker as a yellow circle
     addMarker(lat.value, lng.value, 'yellow', 'destinationStart')

    const latEnd = destination.geometry.coordinates[1];
    const lngEnd = destination.geometry.coordinates[0];
    destinationResult.innerHTML ="";
    destinationResult.innerHTML = `<b>Destination Point: </b> <br> lat: ${latEnd} <br> lng: ${lngEnd}`
    // Add destination marker as a green circle
         addMarker(latEnd, lngEnd, 'green', 'destinationEnd')

    // Fit bounds to include both markers
    var bounds = L.latLngBounds(
        [parseFloat(lat.value ), parseFloat(lng.value )], // Start point
        [latEnd , lngEnd ] // Destination point
    );
    map.fitBounds(bounds);
});

//===================Function to clear inputs
document.querySelector('#clear-destination-inputs').addEventListener("click", function(){
    lat.value = "";
    lng.value = "";
    bearingInput.value = "";
    distanceInput.value = "";
})

/****************************************************************************************************************
 * **************************************************BEARING***********************************************************
 * ************************************************************************************************************** */ 
let polylineBearing, pointA, pointB;
const bearingResult = document.querySelector('#bearing-result')

function bearing() {

            // Get input values
            const latA = document.querySelector('#lat-a').value; // Latitude for point A
            const lngA = document.querySelector('#lng-a').value; // Longitude for point A
            const latB = document.querySelector('#lat-b').value; // Latitude for point B
            const lngB = document.querySelector('#lng-b').value; // Longitude for point B

            // Create Turf.js points
             pointA = turf.point([parseFloat(lngA), parseFloat(latA)]);
             pointB = turf.point([parseFloat(lngB), parseFloat(latB)]);
        
            // Calculate bearing
            const bearing = turf.bearing(pointA, pointB);
            bearingResult.innerHTML = `Bearing: ${bearing} degrees `
            // Add markers to the map 
            addMarker(parseFloat(latA), parseFloat(lngA), 'yellow', 'bearing-start')
            addMarker(parseFloat(latB), parseFloat(lngB), 'green', 'bearing-white')

            // Fit bounds to include both markers
            var bounds = L.latLngBounds(
                [parseFloat(latA), parseFloat(lngA)], // Start point
                [parseFloat(latB), parseFloat(lngB)]  // Destination point
            );
            map.fitBounds(bounds);
        }

// Function to clear inputs
function removeBearing() {
    // Clear input values
    document.querySelector('#lat-a').value = '';
    document.querySelector('#lng-a').value = '';
    document.querySelector('#lat-b').value = '';
    document.querySelector('#lng-b').value = '';

    // Clear bearing result
    bearingResult.innerHTML = '';
}
/****************************************************************************************************************
 * **************************************************DISTANCE***********************************************************
 * ************************************************************************************************************** */ 
let polylineDistance, pointADistance, pointBDistance;
const distanceResult = document.querySelector('#distance-result')

function distance() {
    const latA = document.querySelector('#lat-a-distance').value;
    const lngA = document.querySelector('#lng-a-distance').value;
    const latB = document.querySelector('#lat-b-distance').value;
    const lngB = document.querySelector('#lng-b-distance').value;
    const unitOption = document.querySelector('#unit-distance');

    pointADistance = turf.point([parseFloat(lngA), parseFloat(latA)]);
    pointBDistance = turf.point([parseFloat(lngB), parseFloat(latB)]);
    var options = { units: `${unitOption.value}` };
    var distance = turf.distance(pointADistance, pointBDistance, options);
    distanceResult.innerHTML = `Distance: ${distance} ${unitOption.value} `

    addMarker(parseFloat(latA), parseFloat(lngA), 'yellow', 'pointADistance')
    addMarker(parseFloat(latB), parseFloat(lngB), 'green', 'pointBDistance')

    var bounds = L.latLngBounds(
        [parseFloat(latA), parseFloat(lngA)],
        [parseFloat(latB), parseFloat(lngB)]
    );
    map.fitBounds(bounds);
}
//=========== Function to clear inputs
function clearDistance() {
    document.querySelector('#lat-a-distance').value = '';
    document.querySelector('#lng-a-distance').value = '';
    document.querySelector('#lat-b-distance').value = '';
    document.querySelector('#lng-b-distance').value = '';
    bearingResult.innerHTML = '';
}
