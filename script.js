// LAUNCHING THE MAP
// declare the map
var map = L.map('map').setView([40, -5], 6);
 
//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {}).addTo(map);
 
// set starting council to Elvira 306
var selectedCouncil = 'Elvira 306';

// function to fetch and render GeoJSON data
function renderGeoJSON() {
    fetch("attendance-geodata.geojson")
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(raw_data => {
            L.geoJSON(raw_data, {
                // add vector appearance
                pointToLayer: function(feature, latlng) {
                    var attendanceProperty = selectedCouncil + " Attendance";
                    var attendance = feature.properties[attendanceProperty];
            
                    if (attendance == true) { 
                        return L.circleMarker(latlng, {
                            radius : 7,           // set size adjustment
                            color : "purple",     // set outline color
                            fillColor : "purple", // set fill color
                            fillOpacity : 0.5,    // set transparency
                            weight : 1            // set outline thickness   
                        });
                    } else if (attendance == false) {
                        return L.circleMarker(latlng, {
                            radius : 5,         // set size adjustment
                            color : "red",      // set outline color
                            fillColor : "red",  // set fill color
                            fillOpacity : 0.5,  // set transparency
                            weight : 1          // set outline thickness
                        });
                    }
                }, 
                // add popups
                onEachFeature: function(feature, layer) {  
                    // customize popup content
                    // setup content based on selected council--use a switch statement

                    // set popupContent
                    var popupContent = 
                        `<b>${feature.properties.See || "Unknown Location"}</b><br>
                        Modern City: ${feature.properties.Modern_City || "Unknown"}<br>
                        Province: ${feature.properties.Province || "Unknown"}<br>
                        Bishop Attended: ${feature.properties.selectedCouncil || "None"}<br>
                        Earliest Attested Bishop: ${feature.properties.Earliest_Attested_Bishop || "Unknown"}<br>
                        Notes: ${feature.properties.Notes || "None"}`;
                    layer.bindPopup(popupContent);
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error(error);
        });
}

// fetch and render
renderGeoJSON();

// function to clear layers
function clearLayers() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
};

// declare custom control
var councilSelectorMenu = L.control({position: 'topright'});
councilSelectorMenu.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-control');
    div.innerHTML = '<h1>Select Council</h1>' +
        '<select id="councilSelector">' +
        '<option value="Elvira 306">Elvira 306</option>' +  
        '<option value="Zaragoza 380">Zaragoza 380</option>' +
        '<option value="Toledo 400">Toledo 400</option>' +
        '<option value="Tarragona 516">Tarragona 516</option>' +
        '<option value="Giron 517">Giron 517</option>' +
        '<option value="Toledo 527">Toledo 527</option>' +
        '<option value="Barcelona 540">Barcelona 540</option>' +
        '<option value="Lérida 546">Lérida 546</option>' +
        '<option value="Valencia 546">Valencia 546</option>' +
        '<option value="Braga 561">Braga 561</option>' +
        '<option value="Braga 572">Braga 572</option>' +
        '<option value="Toledo 589">Toledo 589</option>' +
        '</select>';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
councilSelectorMenu.addTo(map);

// handle dropdown change
document.getElementById('councilSelector').addEventListener('change', function(e) {
    const selectedValue = e.target.value;
    selectedCouncil = selectedValue;
    // use a switch statement to handle council selection
    switch (selectedValue) {
        case 'Elvira 306':
            selectedCouncil = 'Elvira 306';
            break;
        case 'Zaragoza 380':
            selectedCouncil = 'Zaragoza 380';
            break;
        case 'Toledo 400':
            selectedCouncil = 'Toledo 400';
            break;
        case 'Tarragona 516':
            selectedCouncil = 'Tarragona 516';
            break;
        case 'Giron 517':
            selectedCouncil = 'Giron 517';
            break;
        case 'Toledo 527':
            selectedCouncil = 'Toledo 527';
            break;
        case 'Barcelona 540':
            selectedCouncil = 'Barcelona 540';
            break;
        case 'Lérida 546':
            selectedCouncil = 'Lérida 546';
            break;
        case 'Valencia 546':
            selectedCouncil = 'Valencia 546';
            break;
        case 'Braga 561':
            selectedCouncil = 'Braga 561';
            break;
        case 'Braga 572':
            selectedCouncil = 'Braga 572';
            break;
        case 'Toledo 589':
            selectedCouncil = 'Toledo 589';
            break;
        // exit the function if an unknown council is selected
        default:
            console.error('Unknown council selected:', selectedValue);
            return;
    }
   clearLayers(); 
   renderGeoJSON();
});
