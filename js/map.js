//======================================================Initialize CodeMirror editor
 const editor = CodeMirror.fromTextArea(document.getElementById('geojson-input'), {
            mode: 'application/json',
            theme: 'dracula',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
            gutters: ['CodeMirror-lint-markers'],
            lint: true
});  
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//======================================================Try to get user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Success - center map on user's location
            latS = position.coords.latitude
            lngS = position.coords.longitude
            zoom = 12
            map.setView([latS, lngS], zoom);

        },
        function(error) {
            // Error - keep default Casablanca view
            console.error("Geolocation error:", error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    // Geolocation not supported - keep default Casablanca view
    console.log("Geolocation is not supported by this browser");
    alert("Geolocation is not supported by this browser")
}

//======================================================baseLayers
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
}).addTo(map);

//========================================================masterLayer

let masterLayer;
const storedLayer = localStorage.getItem('masterLayer');
if (storedLayer) {
  try {
    const geojson = JSON.parse(storedLayer);

    // Function to apply styles from feature properties
    const style = (feature) => {
      return {
        color: feature.properties.color || '#3388ff',
        weight: feature.properties.weight || 2,
        opacity: feature.properties.opacity || 0.7,
        fillOpacity: feature.properties.fillOpacity || 0.7,
      };
    };

    // Function to generate popup content
    const generatePopupContent = (properties) => {
      return Object.entries(properties).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>');
    };

    // onEachFeature handler to bind popup
    const onEachFeature = (feature, layer) => {
      if (feature.properties) {
        const popupEl = document.createElement('div');
        popupEl.style.fontFamily = 'Arial';
        popupEl.style.padding = '5px';
        popupEl.style.display = 'inline-block';
        popupEl.style.whiteSpace = 'nowrap';
        popupEl.style.maxWidth = 'none';
        popupEl._layer = layer;

        // Filter out style-related properties if needed
        const headers = Object.keys(feature.properties).filter(
          key => !['color', 'weight', 'opacity', 'fillOpacity'].includes(key)
        );

        const thead = headers.map((key, i) => `
          <th>
            <input type="text" value="${key}" oninput="renameHeader(this, ${i})">
          </th>
        `).join('') + '<th>-</th>';

        const tds = headers.map(key => `
          <td contenteditable="false">${feature.properties[key]}</td>
        `).join('') + `<td><button onclick="toggleEdit(this)">Edit</button></td>`;

        popupEl.innerHTML = `
          <div style="margin-bottom: 10px;">
            <button onclick="addColumn()">Add Column</button>
          </div>
          <table id="popupTable" style="border-collapse: collapse;">
            <thead>
              <tr id="headerRow">${thead}</tr>
            </thead>
            <tbody>
              <tr>${tds}</tr>
            </tbody>
          </table>
          <button onclick="saveTableData(this)">Save</button>
        `;

        layer.bindPopup(popupEl, { maxWidth: 'auto' });
      }
    };

    // Create the GeoJSON layer with custom styling and popup behavior
    masterLayer = L.geoJSON(geojson, {
      style: style,
      onEachFeature: onEachFeature,
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, style(feature));
      }
    }).addTo(map);

    // Only fit bounds if the layer has features
    if (masterLayer.getLayers().length > 0) {
      // Use setTimeout to ensure layer is fully rendered
      setTimeout(() => {
        try {
          const bounds = masterLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch (e) {
          console.error('Error fitting bounds:', e);
        }
      }, 100);
    }

  } catch (e) {
    console.error('Failed to parse stored layer:', e);
    masterLayer = L.featureGroup().addTo(map);
  }
} else {
  masterLayer = L.featureGroup().addTo(map);
}


// Function to save the layer with all properties
function saveMasterLayer() {
  if (masterLayer) {
    const geojson = masterLayer.toGeoJSON();
    localStorage.setItem('masterLayer', JSON.stringify(geojson));
  }
}
//======================================================LAYER CONTROL
var baseMaps = {
    "CartoDB_DarkMatter": CartoDB_DarkMatter,
    "OpenStreetMap": osm,
    "Google Sat": googleSat
  };

var overlayMaps = {
    "OpenSeaMap": OpenSeaMap,
    "Master Layer": masterLayer
  };

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);


//======================================================Add scalebar to map
L.control.scale({metric: true, imperial: false, maxWidth: 100, position: 'bottomright'}).addTo(map);
//======================================================SEARCH LOCATION 
new L.Control.Geocoder({position: 'topleft'}).addTo(map);

//=======================================================PRINT MAP
L.control.bigImage({position: 'topleft'}).addTo(map);
//======================================================Add the measurement control to the map
  var measureControl = new L.Control.PolylineMeasure({
    position: 'topleft',
    unit: 'metres',
    showBearings: true,
    clearMeasurementsOnStop: false,
    showClearControl: true,
    showUnitControl: true,
    measureControlTitleOn: 'Turn on PolylineMeasure',
    measureControlTitleOff: 'Turn off PolylineMeasure',
    measureControlLabel: '&#8614;',
    backgroundColor: 'white',
    cursor: 'crosshair',
    clearControlTitle: 'Clear Measurements',
    unitControlTitle: {
      text: 'Change Units',
      metres: 'Meters',
      kilometres: 'Kilometers',
      feet: 'Feet',
      landmiles: 'Miles (Land)',
      nauticalmiles: 'Nautical Miles',
      yards: 'Yards',
      surveyfeet: 'Survey Feet',
      surveychains: 'Survey Chains',
      surveylinks: 'Survey Links',
      surveymiles: 'Survey Miles'
    }
  });
  
  measureControl.addTo(map);
//======================================================Mousemove coordinates
const coordinates = document.getElementById("coordinates")
function onMapMove(e){
    let lat = e.latlng.lat
    let lng = e.latlng.lng
    coordinates.innerHTML = "";
    coordinates.innerHTML = `
    <div>
    <p class="coordinates-para"> <b> Lat: </b> ${lat} / <b> Lng: </b> ${lng} </p>
    </div>
    `;
}
map.on('mousemove', onMapMove)

//======================================================Draw new features
// Get the color picker element
const colorPicker = document.getElementById('color-picker');

// Initialize draw controls with dynamic color (later)
var drawControl = map.pm.addControls({
  position: 'topright',
  drawCircle: true,
  drawRectangle: true,
  drawPolygon: true,
  drawMarker: true,
  drawCircleMarker: true,
  drawPolyline: true,
  cutPolygon: true,
  removalMode: true,
  editMode: true,
  dragMode: true,
  pinningOption: true,
  snappingOption: true,
  snapping: {}, // Configure if needed
  tooltips: true,
  templineStyle: {
    color: 'green',
    dashArray: '5,5',
  },
  hintlineStyle: {
    color: 'white',
    dashArray: '1,5',
  },
  pathOptions: {
    color: colorPicker.value, // Use selected color
    fillColor: colorPicker.value, // Same for fill (adjust if needed)
    fillOpacity: 0.4,
  },
});

// Disable drawing mode for circles and markers by default (if needed)
map.pm.disableDraw('Circle');
map.pm.disableDraw('Marker');
// Update color when a new color is picked
colorPicker.addEventListener('input', function() {
  map.pm.setPathOptions({
    color: this.value,
    fillColor: this.value, // Optional: Use a different fill color
    fillOpacity: 0.4,
  });
});
// Listen for when a new shape is created
map.on('pm:create', function (e) {
  const layer = e.layer;

  // Initialize feature properties
  layer.feature = layer.feature || { type: 'Feature', properties: {}, geometry: null };
  layer.feature.properties.color = colorPicker.value;
  layer.feature.properties.fillOpacity = 0.4;

  // Create popup content as DOM element (not a string)
  const popupEl = document.createElement('div');
  popupEl.style.fontFamily = 'Arial';
  popupEl.style.padding = '5px';

  // Store the layer reference directly on the popup DOM element
  popupEl._layer = layer;

  // Build inner HTML of popup
  popupEl.innerHTML = `
    <div style="margin-bottom: 10px;">
      <button onclick="addColumn()">Add Column</button>
    </div>
    <table id="popupTable" style="border-collapse: collapse;">
      <thead>
        <tr id="headerRow">
          <th><input type="text" placeholder="Column 1" oninput="renameHeader(this, 0)"></th>
          <th>-</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td contenteditable="false"></td>
          <td><button onclick="toggleEdit(this)">Edit</button></td>
        </tr>
      </tbody>
    </table>
    <button onclick="saveTableData(this)">Save</button>
  `;

  // Bind the popup element
  layer.bindPopup(popupEl, {
    maxWidth: 'auto'
  });

  // Add to master layer group
  masterLayer.addLayer(layer);

  // Update GeoJSON editor
  updateEditorFromMasterLayer();
});

function saveTableData(button) {
  const popup = button.closest('div');
  const table = popup.querySelector('#popupTable');

  const headerInputs = table.querySelectorAll('thead input');
  const firstRow = table.querySelector('tbody tr');
  const cells = firstRow ? firstRow.querySelectorAll('td') : [];

  const layer = popup._layer;

  if (layer) {
    // Clear previous dynamic properties
    for (const key in layer.feature.properties) {
      if (!['color', 'fillOpacity', 'opacity', 'weight'].includes(key)) {
        delete layer.feature.properties[key];
      }
    }

    // Save only non-empty headers and values
    for (let i = 0; i < headerInputs.length; i++) {
      const key = headerInputs[i].value.trim();
      const value = cells[i]?.textContent.trim();

      if (key !== '' && value !== '') {
        layer.feature.properties[key] = value;
      }
    }

    // Update editor and save
    updateEditorFromMasterLayer();
    saveMasterLayer();
  } else {
    console.warn('⚠️ Layer not found. Could not save data.');
  }
}


// Define debounce function (if not already defined)
function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

//======================================================Convert Features to Geojson
function updateEditorFromMasterLayer() {
    try {
        // Convert FeatureGroup to GeoJSON
        const geoJsonData = masterLayer.toGeoJSON();
        
        // Format as a pretty-printed JSON string
        const geoJsonString = JSON.stringify(geoJsonData, null, 2);
        
        // Update CodeMirror editor content
        editor.setValue(geoJsonString);       
    } catch (err) {
        console.error("Failed to export GeoJSON:", err);
        editor.setValue("Error: Could not generate GeoJSON");
    }
}

// Initialize editor with current masterLayer content
updateEditorFromMasterLayer();

//======================================================IMPORT DATA
document.getElementById('import-geojson').addEventListener('click', () => {
document.getElementById('geojson-file').click();
});
let importedLayer = null
document.getElementById('geojson-file').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const geojsonData = JSON.parse(e.target.result); 
                
                importedLayer = L.geoJSON(geojsonData, {
                    // Apply style based on GeoJSON properties
                    style: function(feature) {
                        return {
                            fillColor: feature.properties.color || '#3388ff', // Default blue if no color
                            weight: 2,          // Border width
                            opacity: 1,        // Border opacity
                            color: feature.properties.color || '#3388ff',     // Border color
                            fillOpacity: feature.properties.fillOpacity || 0.7 // Default fill opacity
                        };
                    },
                   onEachFeature: function (feature, layer) {
                        if (feature.properties) {
                          addFeatures(layer);
                          updateEditorFromMasterLayer();
                          saveMasterLayer();

                          const popupEl = document.createElement('div');
                          popupEl.style.fontFamily = 'Arial';
                          popupEl.style.padding = '5px';
                          popupEl._layer = layer; // For saveTableData()

                          // Create table HTML
                          let headers = Object.keys(feature.properties).filter(
                            key => key !== 'color' && key !== 'fillOpacity'
                          );

                          let thead = headers.map((key, i) => `
                            <th>
                              <input type="text" value="${key}" oninput="renameHeader(this, ${i})">
                            </th>
                          `).join('') + '<th>-</th>';

                          let tds = headers.map(key => `
                            <td contenteditable="false">${feature.properties[key]}</td>
                          `).join('') + `<td><button onclick="toggleEdit(this)">Edit</button></td>`;

                          popupEl.innerHTML = `
                            <div style="margin-bottom: 10px;">
                              <button onclick="addColumn()">Add Column</button>
                            </div>
                            <table id="popupTable" style="border-collapse: collapse;">
                              <thead>
                                <tr id="headerRow">${thead}</tr>
                              </thead>
                              <tbody>
                                <tr>${tds}</tr>
                              </tbody>
                            </table>
                            <button onclick="saveTableData(this)">Save</button>
                          `;
                      layer.bindPopup(popupEl, {
                        maxWidth: 'auto'
                      });
                        }
                      }
                }).addTo(map);
                map.fitBounds(importedLayer.getBounds());
            } catch (error) {
                console.error("Error loading GeoJSON:", error);
                alert("Invalid GeoJSON file. Please check the format.");
            }
        };
        reader.readAsText(file);
    }
});

//========================================================rasterLayer
let uploadedImageUrl = null
let rasterLayer = null;
// Load image when selected
document.getElementById('rasterFileInput').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImageUrl = e.target.result; // Store the image as Data URL
  };
  reader.readAsDataURL(file);
});
// On page load, try to load saved raster layer
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('rasterImage');
  if (saved) {
    const data = JSON.parse(saved);
    rasterLayer = L.imageOverlay(data.image, data.bounds).addTo(map);
    map.fitBounds(data.bounds);
      // Add rasterLayer to layer control
    layerControl.addOverlay(rasterLayer, "Raster Layer");
  }
});

// On "Add Raster" button click
document.getElementById('addRasterBtn').addEventListener('click', () => {
  if (!uploadedImageUrl) {
    alert("Please upload an image first.");
    return;
  }

  const south = parseFloat(document.getElementById('south').value);
  const west = parseFloat(document.getElementById('west').value);
  const north = parseFloat(document.getElementById('north').value);
  const east = parseFloat(document.getElementById('east').value);

  const bounds = [[south, west], [north, east]];

  // Remove old rasterLayer if exists
  if (rasterLayer) {
    map.removeLayer(rasterLayer);
  }

  // Add new layer
  rasterLayer = L.imageOverlay(uploadedImageUrl, bounds).addTo(map);
  map.fitBounds(bounds);

  // Save to localStorage
  const rasterData = {
    image: uploadedImageUrl,
    bounds: bounds,
  };
  localStorage.setItem('rasterImage', JSON.stringify(rasterData));
  // Add rasterLayer to layer control
layerControl.addOverlay(rasterLayer, "Raster Layer");
});
//===================Remove Raster Layer
function removeRasterLayer() {
  if (rasterLayer) {
    map.removeLayer(rasterLayer);

    // Optionally remove from layer control (if it's not handled automatically)
    if (layerControl && layerControl.removeLayer) {
      layerControl.removeLayer(rasterLayer);
    }

    rasterLayer = null;
    localStorage.removeItem('rasterImage');
    console.log("Raster layer removed.");
  } else {
    console.log("No raster layer to remove.");
  }
}
//======================================================Edit Events
function addFeatures(layer){
                                  masterLayer.addLayer(layer);
                                  saveMasterLayer()
                                  console.log(masterLayer);
}
function removeFeatures(layer){
                                  masterLayer.removeLayer(layer);
                                  saveMasterLayer()
}

map.on('pm:create', function(e) {      
                                  addFeatures(e.layer)
                                  updateEditorFromMasterLayer()
                                }); 

map.on('pm:remove', function(e) { 
                                 // drawLayer.removeLayer(e.layer);
                                  removeFeatures(e.layer)
                                  updateEditorFromMasterLayer()
                                  saveMasterLayer()
                                });
map.on('pm:globaldragmodetoggled', function(e) { 
                                   updateEditorFromMasterLayer()
                                   saveMasterLayer()
});

map.on('pm:globaleditmodetoggled', function(e) {  
                                  updateEditorFromMasterLayer()
                                  saveMasterLayer()
})
map.on('pm:globalrotatemodetoggled', function(e) {  
  updateEditorFromMasterLayer()      
  saveMasterLayer()                           
})

//======================================================Download Data
function downloadMasterLayer() {
          if (!masterLayer || masterLayer.getLayers().length === 0) {
      alert('No elements to download!');
      return;
    }
  try {
    // Convert FeatureGroup to GeoJSON
    const geoJsonData = masterLayer.toGeoJSON();
    
    // Convert to formatted JSON string
    const geoJsonString = JSON.stringify(geoJsonData, null, 2);
    
    // Create download link
    const blob = new Blob([geoJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_data_${new Date().toISOString().slice(0,10)}.geojson`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (err) {
    console.error("Download failed:", err);
    alert("⚠️ Failed to export GeoJSON\n" + err.message);
  }
}

//======================================================Copy Json
function copyJSON() {
  try {
    // Get the current editor content
    const content = editor.getValue();
    
    // Copy to clipboard
    navigator.clipboard.writeText(content).then(() => {
      
      // Optional: Visual selection feedback
      editor.execCommand("selectAll");
      setTimeout(() => editor.execCommand("singleSelection"), 500);
    }).catch(err => {
      console.error("Copy failed:", err);
      alert("❌ Failed to copy. Please try again or check console.");
    });
    
  } catch (err) {
    console.error("Copy error:", err);
    alert("⚠️ Copy operation failed: " + err.message);
  }
}

//======================================================Remove all layers (masterLayer)
function removeAllLayers() {
  masterLayer.clearLayers();
  localStorage.removeItem('masterLayer');
  updateEditorFromMasterLayer()
}


