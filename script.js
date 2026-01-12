// LAUNCHING THE MAP //

// declare the map
var map = L.map('map').setView([40, -5], 6);
 
//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {}).addTo(map);
 
// set starting council to Elvira 306
var selectedCouncil = 'Elvira_306';
numBishopsAttended = 0;
numBishopsNotAttended = 0;


// FUNCTION TO FETCH AND RENDER GEOJSON DATA //
function renderGeoJSON() {
    // reset counters
    numBishopsAttended = 0;
    numBishopsNotAttended = 0;
    
    fetch("attendance-geodata.geojson")
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(raw_data => {
            L.geoJSON(raw_data, {
                // ADD ATTENDANCE VECTOR STYLES //
                pointToLayer: function(feature, latlng) {
                    var attendanceProperty = selectedCouncil + " Attendance";
                    var attendance = feature.properties[attendanceProperty];

                // normalize attendance values
                    // marks bishops whose attendance is true
                    if (attendance == true) {
                        var diamondIcon = L.divIcon({
                            className: "custom-diamond-icon",
                            html: '<i class="fas fa-diamond" style="color: purple; font-size: 16px;"></i>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        return L.marker(latlng, { icon: diamondIcon });
                    
                    // marks bishops whose attendance is false
                    } else { (attendance == false) 
                        return L.circleMarker(latlng, {
                            radius: 5,
                            color: "black",
                            fillColor: "orange",
                            fillOpacity: 0.5,
                            weight: 1
                        });
                    }   
                }, 

                // ADD POPUP CONTENT //
                onEachFeature: function(feature, layer) {  
                    // set bishop attended based on selected council
                    var bishopAttended = feature.properties[selectedCouncil];
                    bishopAttended = bishopAttended[selectedCouncil]
                    switch (selectedCouncil) {
                        case 'Elvira_306':
                            bishopAttended = feature.properties.Elvira_306 || "None";
                            break;
                        case 'Zaragoza_380':
                            bishopAttended = feature.properties.Zaragoza_380 || "None";
                            break;
                        case 'Toledo_400':
                            bishopAttended = feature.properties.Toledo_400 || "None";
                            break;
                        case 'Tarragona_516':
                            bishopAttended = feature.properties.Tarragona_516 || "None";
                            break;
                        case 'Giron_517':
                            bishopAttended = feature.properties.Giron_517 || "None";
                            break;
                        case 'Toledo_527':
                            bishopAttended = feature.properties.Toledo_527 || "None";
                            break;
                        case 'Barcelona_540':
                            bishopAttended = feature.properties.Barcelona_540 || "None";
                            break;
                        case 'Lérida_546':
                            bishopAttended = feature.properties.Lérida_546 || "None";
                            break;
                        case 'Valencia_546':
                            bishopAttended = feature.properties.Valencia_546 || "None";
                            break;
                        case 'Braga_561':
                            bishopAttended = feature.properties.Braga_561 || "None";
                            break;
                        case 'Braga_572':
                            bishopAttended = feature.properties.Braga_572 || "None";
                            break;
                        case 'Toledo_589':
                            bishopAttended = feature.properties.Toledo_589 || "None";
                            break;
                        default:
                            bishopAttended = "None";
                            break;
                    }

                    // set popupContent features
                    var popupContent = 
                        `<b>${feature.properties.See || "Unknown Location"}</b><br>
                        Modern City: ${feature.properties.Modern_City || "Unknown"}<br>
                        Province: ${feature.properties.Province || "Unknown"}<br>
                        Bishop Attended: ${bishopAttended || "None"}<br>
                        Earliest Attested Bishop: ${feature.properties.Earliest_Attested_Bishop || "Unknown"}<br>
                        Notes: ${feature.properties.Notes || "None"}`;
                    layer.bindPopup(popupContent);
                
                }
            }).addTo(map);
            
            // COUNT ATTENDANCE STATISTICS //
            for (var i = 0; i < raw_data.features.length; i++) {
                var feature = raw_data.features[i];
                var attendanceProperty = selectedCouncil + " Attendance";
                if (feature.properties[attendanceProperty] === true) {
                    numBishopsAttended += 1;
                } else {
                    numBishopsNotAttended += 1;
                }
            }
            
            // update the stats box
            updateAttendanceStatsBox();
        })
        .catch(error => {
            console.error(error);
        });
}

// fetch and render
renderGeoJSON();


// FUNCTION TO CLEAR EXISTING LAYERS //
function clearLayers() {
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
};


// COUNCIL SELECTION CONTROL //
var councilSelectorMenu = L.control({position: 'topright'});
councilSelectorMenu.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-control');
    div.innerHTML = '<h1>Select Council</h1>' +
        '<select id="councilSelector">' +
        '<option value="Elvira_306">Elvira 306</option>' +  
        '<option value="Zaragoza_380">Zaragoza 380</option>' +
        '<option value="Toledo_400">Toledo 400</option>' +
        '<option value="Tarragona_516">Tarragona 516</option>' +
        '<option value="Giron_517">Giron 517</option>' +
        '<option value="Toledo_527">Toledo 527</option>' +
        '<option value="Barcelona_540">Barcelona 540</option>' +
        '<option value="Lérida_546">Lérida 546</option>' +
        '<option value="Valencia_546">Valencia 546</option>' +
        '<option value="Braga_561">Braga 561</option>' +
        '<option value="Braga_572">Braga 572</option>' +
        '<option value="Toledo_589">Toledo 589</option>' +
        '</select>';
    div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
councilSelectorMenu.addTo(map);


// HANDLE DROPDOWN CHANGE EVENT //
document.getElementById('councilSelector').addEventListener('change', function(e) {
    selectedCouncil = e.target.value;

   clearLayers(); 
   renderGeoJSON();
});


// ATTENDANCE STATISTICS INFO BOX //
function updateAttendanceStatsBox() {
    var statsBox = document.getElementById('attendance-stats');
    
    // parse council name for display
    var councilDisplay = selectedCouncil.replace('_', ' ');
    
    // calculate percentages
    var totalBishops = numBishopsAttended + numBishopsNotAttended;
    var attendancePercent = totalBishops > 0 ? Math.round((numBishopsAttended / totalBishops) * 100) : 0;
    
    statsBox.innerHTML = `
        <h3>Record of Attendance: ${councilDisplay}</h3>
        <span class="toggle-indicator">[−]</span>
        <div class="stats-content">
            <div class="stat-row">
                <span class="stat-label">Bishops Attended:</span>
                <span class="stat-value">${numBishopsAttended}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Bishops Absent:</span>
                <span class="stat-value">${numBishopsNotAttended}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Total Bishoprics:</span>
                <span class="stat-value">${totalBishops}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Attendance Rate:</span>
                <span class="stat-value">${attendancePercent}%</span>
            </div>
        </div>
    `;
}

// click handler to toggle expand/collapse on stats box
document.addEventListener('click', function(e) {
    var statsBox = document.getElementById('attendance-stats');
    if (statsBox && statsBox.contains(e.target) && !e.target.classList.contains('stat-label') && !e.target.classList.contains('stat-value')) {
        statsBox.classList.toggle('collapsed');
        var indicator = statsBox.querySelector('.toggle-indicator');
        if (indicator) {
            indicator.textContent = statsBox.classList.contains('collapsed') ? '[+]' : '[−]';
        }
    }
});
updateAttendanceStatsBox();


// DESCRIPTION PANEL CONTROL //
var descriptionMenu = L.control({position: 'topleft'});
var descriptionVisible = false;

// handle description toggle click
document.getElementById('description_toggle').addEventListener('click', function(e) {
    var panel = document.getElementById('description-panel');
    descriptionVisible = !descriptionVisible;
    panel.style.display = descriptionVisible ? 'block' : 'none';
});

// add description panel to map
descriptionMenu.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'custom-control');
    div.id = 'description-panel';
    div.innerHTML = '<h1>Map Information <span class="minimize-btn">[−]</span></h1>' +
        '<div class="description-content">' +
        '<p>This interactive tool visualizes episcopal attendance at twelve Church Councils (deliberative meetings of bishops) in Roman and post-Roman Hispania. The Councils span nearly three centuries, from the Council of Elvira (306 CE) to the Third Council of Toledo (589 CE). Based on research from the dissertation "Wars and Rumors of War: Archaeology, Violence, and the End of Roman Spain," this map allows users to explore the geographic distribution of participating bishoprics for each council, revealing significant patterns in ecclesiastical organization and regional connectivity during the transition from late antiquity to the early medieval period.</p>' +
        '<h3>How to Use the Map</h3>' +
        '<p>Select a council from the available list to populate the map with markers indicating the sees (episcopal seats) from which bishops are known to have attended. Each marker represents a bishopric whose representative participated in the selected council.</p>' +
        '<ul>' +
        '<li><strong>Purple Diamond:</strong> Bishop attended the selected council.</li>' +
        '<li><strong>Orange Circle:</strong> Bishops known to have attended any Iberian council during this period (contextual reference points).</li>' +
        '</ul>' +
        '</div>';
    div.style.display = 'none';
    div.onmousedown = div.ondblclick = L.DomEvent.stopPropagation;
    return div;
};
descriptionMenu.addTo(map);

// handle minimize/expand for description panel
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('minimize-btn') || (e.target.parentElement && e.target.parentElement.classList.contains('minimize-btn'))) {
        var panel = document.getElementById('description-panel');
        panel.classList.toggle('minimized');
        var btn = panel.querySelector('.minimize-btn');
        if (btn) {
            btn.textContent = panel.classList.contains('minimized') ? '[+]' : '[−]';
        }
    }
});
