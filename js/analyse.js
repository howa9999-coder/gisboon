//===============Search point
document.querySelector('#search-point').addEventListener("click", function () {
    const lat = parseFloat(document.querySelector('#lat').value);
    const lng = parseFloat(document.querySelector('#log').value);

    // Add a marker
    var point = L.marker([lat, lng]).addTo(map);

    // Set the view to the marker's location
    map.setView([lat, lng], 13); // Adjust zoom level as needed

    // Add a popup with a delete button
    point.bindPopup(`
        <div>
            <p>(${lat.toFixed(5)}, ${lng.toFixed(5)})</p>
            <button id="delete-marker">Delete</button>
        </div>
    `);

    // Open the popup immediately
    point.openPopup();

    // Event listener for the delete button
    map.on('popupopen', function () {
        document.querySelector('#delete-marker').addEventListener('click', function () {
            map.removeLayer(point); // Remove the marker
        });
    });
});

// Destination point

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

    // Add start marker as a green circle
    start = L.circleMarker([lat.value, lng.value], {
        color: "blue",
        radius: 8, // Adjust size of the circle
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);

    const latEnd = destination.geometry.coordinates[1];
    const lngEnd = destination.geometry.coordinates[0];
    destinationResult.innerHTML ="";
    destinationResult.innerHTML = `<b>Destination Point: </b> <br> lat: ${latEnd} <br> lng: ${lngEnd}`
    // Add destination marker as a red circle
    end = L.circleMarker([latEnd, lngEnd], {
        color: "green",
        radius: 8, // Adjust size of the circle
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);

    // Add popups
    start.bindPopup(`
        <div>
            <p>Start Point: (${lat.value}, ${lng.value})</p>
        </div>
    `);
    end.bindPopup(`
        <div>
            <p>Destination Point: (${latEnd.toFixed(5)}, ${lngEnd.toFixed(5)})</p>
        </div>
    `);

    // Fit bounds to include both markers
    var bounds = L.latLngBounds(
        [parseFloat(lat.value ), parseFloat(lng.value )], // Start point
        [latEnd , lngEnd ] // Destination point
    );
    map.fitBounds(bounds);
});

//Delete destination point
document.querySelector('#clear-destination-inputs').addEventListener("click", function(){
    lat.value = "";
    lng.value = "";
    bearingInput.value = "";
    distanceInput.value = "";
    map.removeLayer(start);
    map.removeLayer(end);
})

//==============================================================Bearing
let polylineBearing, pointA, pointB;
const bearingResult = document.querySelector('#bearing-result')


// Function to remove bearing and clear inputs
function removeBearing() {
    // Clear input values
    document.querySelector('#lat-a').value = '';
    document.querySelector('#lng-a').value = '';
    document.querySelector('#lat-b').value = '';
    document.querySelector('#lng-b').value = '';

    // Clear bearing result
    bearingResult.innerHTML = '';

    // Optionally, remove LAYERS from the map
    if (polylineBearing || pointA || pointB) {
        map.removeLayer(polylineBearing);
        map.removeLayer(pointA);
        map.removeLayer(pointB);
    }
}
function bearing() {


            // Get input values
            const latA = document.querySelector('#lat-a').value; // Latitude for point A
            const lngA = document.querySelector('#lng-a').value; // Longitude for point A
            const latB = document.querySelector('#lat-b').value; // Latitude for point B
            const lngB = document.querySelector('#lng-b').value; // Longitude for point B
            // Validate inputs
            if (isNaN(parseFloat(latA)) || isNaN(parseFloat(lngA)) || isNaN(parseFloat(latB)) || isNaN(parseFloat(lngB))) {
                console.error("Invalid input values. Please enter valid numbers.");
                return;
            }
                // Optionally, remove the polyline from the map
    if (polylineBearing || pointA || pointB) {
        map.removeLayer(polylineBearing);
        map.removeLayer(pointA);
        map.removeLayer(pointB);
    }
            // Create Turf.js points
             pointA = turf.point([parseFloat(lngA), parseFloat(latA)]);
             pointB = turf.point([parseFloat(lngB), parseFloat(latB)]);
        
            // Calculate bearing
            const bearing = turf.bearing(pointA, pointB);
            bearingResult.innerHTML = `Bearing: ${bearing} degrees `
            //Clear map
          /*  if (polylineBearing) {
                polylineBearing.remove();
            }*/
            // Add markers to the map
            pointA = L.circleMarker([parseFloat(latA), parseFloat(lngA)], {
                color: "blue",
                radius: 5,
                fillColor: "blue",
                fillOpacity: 0.8
            }).addTo(map);
        
            pointB = L.circleMarker([parseFloat(latB), parseFloat(lngB)], {
                color: "green",
                radius: 5,
                fillColor: "green",
                fillOpacity: 0.8
            }).addTo(map);
            var points = [
                [latA, lngA], // Point A
                [latB, lngB] // Point B
            ];
            polylineBearing  = L.polyline(points, {
                color: 'black', // Line color
                weight: 5,    // Line thickness
                opacity: 0.7, // Line opacity
                dashArray: '10, 5' // Optional: Dashed line pattern
            }).addTo(map);
            // Fit bounds to include both markers
            var bounds = L.latLngBounds(
                [parseFloat(latA), parseFloat(lngA)], // Start point
                [parseFloat(latB), parseFloat(lngB)]  // Destination point
            );
            map.fitBounds(bounds);
        }


let polylineDistance, pointADistance, pointBDistance;
const distanceResult = document.querySelector('#distance-result')
//=========== DELETE DISTANCE RESULT
function removeDistance() {
    document.querySelector('#lat-a-distance').value = '';
    document.querySelector('#lng-a-distance').value = '';
    document.querySelector('#lat-b-distance').value = '';
    document.querySelector('#lng-b-distance').value = '';
    bearingResult.innerHTML = '';
    if (polylineDistance || pointADistance || pointBDistance) {
        map.removeLayer(polylineDistance);
        map.removeLayer(pointADistance);
        map.removeLayer(pointBDistance);
    }
}
//++++++++++++++Distance RESULT
function distance() {
    const latA = document.querySelector('#lat-a-distance').value;
    const lngA = document.querySelector('#lng-a-distance').value;
    const latB = document.querySelector('#lat-b-distance').value;
    const lngB = document.querySelector('#lng-b-distance').value;
    const unitOption = document.querySelector('#unit-distance');

    if (isNaN(parseFloat(latA)) || isNaN(parseFloat(lngA)) || isNaN(parseFloat(latB)) || isNaN(parseFloat(lngB))) {
        console.error("Invalid input values. Please enter valid numbers.");
        return;
    }
    if (polylineDistance || pointADistance || pointBDistance) {
        map.removeLayer(polylineDistance);
        map.removeLayer(pointADistance);
        map.removeLayer(pointBDistance);
    }


    pointADistance = turf.point([parseFloat(lngA), parseFloat(latA)]);
    pointBDistance = turf.point([parseFloat(lngB), parseFloat(latB)]);
    var options = { units: `${unitOption.value}` };
    var distance = turf.distance(pointADistance, pointBDistance, options);
    distanceResult.innerHTML = `Distance: ${distance} ${unitOption.value} `
    pointADistance = L.circleMarker([parseFloat(latA), parseFloat(lngA)], {
        color: "blue",
        radius: 5,
        fillColor: "blue",
        fillOpacity: 0.8
    }).addTo(map);
    pointBDistance = L.circleMarker([parseFloat(latB), parseFloat(lngB)], {
        color: "green",
        radius: 5,
        fillColor: "green",
        fillOpacity: 0.8
    }).addTo(map);
    var points = [
        [latA, lngA],
        [latB, lngB]
    ];
    polylineDistance  = L.polyline(points, {
        color: 'black',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 5'
    }).addTo(map);
    var bounds = L.latLngBounds(
        [parseFloat(latA), parseFloat(lngA)],
        [parseFloat(latB), parseFloat(lngB)]
    );
    map.fitBounds(bounds);
}