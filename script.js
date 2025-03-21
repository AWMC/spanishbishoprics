// LAUNCHING THE MAP
// declare the map
var map = L.map('map').setView([40, -5], 6);
 
//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {}).addTo(map);
 
// set starting council to Elvira 306
var selectedCouncil = 'Elvira 306';

// Function to fetch and render GeoJSON data
function renderGeoJSON() {
    fetch("attendance-geodata.geojson")
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(raw_data => {
            L.geoJSON(raw_data, {
                //add vector appearance
                pointToLayer: function(feature, latlng) {
                    var attendanceProperty = selectedCouncil + " Attendance";
                    var attendance = feature.properties[attendanceProperty];
            
                    if (attendance == true) { 
                        return L.circleMarker(latlng, {
                            radius : 7,           // set size adjustment
                            color : "green",      // set outline color
                            fillColor : "green",  // set fill color
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
                //add popups
                onEachFeature: function(feature, layer) {  
                    //customize popup content
                    //setup content based on selected council--use a switch statement

                    //set popupContent
                    var popupContent = 
                        `<b>${feature.properties.See}</b><br>
                        Province: ${feature.properties.Province || "Unknown"}<br>
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
        '<option value="Lerida 546">Lerida 546</option>' +
        '<option value="Valencia 546">Valencia 546</option>' +
        '<option value="Braga 561">Braga 561</option>' +
        '<option value="Braga 572">Braga 572</option>' +
        '<option value="Toledo 589">Toledo 589</option>' +
        '</select>';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
councilSelectorMenu.addTo(map);

// Handle dropdown change
document.getElementById('councilSelector').addEventListener('change', function(e) {
    selectedCouncil = e.target.value;
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
    renderGeoJSON();
});