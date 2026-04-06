// LAUNCHING THE MAP //

// declare the map
var map = L.map('map').setView([40, -5], 6);
 
//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {
    maxZoom: 9,
    maxNativeZoom: 9,
    minZoom: 3,
    attribution: '&copy; <a href="https://awmc.unc.edu/">Ancient World Mapping Center</a> | &copy; <a href="https://cawm.lib.uiowa.edu/index.html">Consortium of Ancient World Mappers</a>'
}).addTo(map);

map.createPane('labels');
map.getPane('labels').style.pointerEvents = 'none';
map.getPane('labels').style.zIndex = 650; 

 // GLOBAL LAYERS //
let bishopLayer = null;
let labelLayer = null;
let councilStats = {};
const LABEL_MIN_ZOOM = 6.5;

function updateLabelsForZoom() {
    if (!labelLayer) return;
    if (map.getZoom() >= LABEL_MIN_ZOOM) {
        if (!map.hasLayer(labelLayer)) map.addLayer(labelLayer);
    } else {
        if (map.hasLayer(labelLayer)) map.removeLayer(labelLayer);
    }
}

// update when zoom changes
map.on('zoomend', updateLabelsForZoom)

// default starting council to Elvira 306
var selectedCouncil = 'Elvira_306';

// FUNCTION TO FETCH AND RENDER GEOJSON DATA //
function renderGeoJSON() {
    fetch("attendance-geodata.geojson")
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(raw_data => {
            // store council summary stats from geojson
            councilStats = raw_data.council_stats || {};

            // remove existing bishop layer before redrawing
            if (bishopLayer) {
                map.removeLayer(bishopLayer);
            }

            bishopLayer = L.geoJSON(raw_data, {
                // ADD ATTENDANCE VECTOR STYLES //
                pointToLayer: function(feature, latlng) {
                    var attendanceProperty = selectedCouncil + " Attendance";
                    var attendance = feature.properties[attendanceProperty];

                    // marks bishops whose attendance is true
                    if (attendance === true) {
                        var diamondIcon = L.divIcon({
                            className: "custom-diamond-icon",
                            html: '<i class="fas fa-diamond" style="color: purple; font-size: 16px;"></i>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        return L.marker(latlng, { icon: diamondIcon });

                    // marks bishops whose attendance is false
                    } else {
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
                    var seeName = feature.properties.See || "Unknown Location";
                    var pleiadesUrl = feature.properties.Pleiades_URL || null;

                    var popupTitle = pleiadesUrl
                        ? `<a href="${pleiadesUrl}" target="_blank" rel="noopener noreferrer"><b>${seeName}</b></a>`
                        : `<b>${seeName}</b>`;

                    var popupContent = 
                        `${popupTitle}<br>
                        Modern City: ${feature.properties.Modern_City || "Unknown"}<br>
                        Province: ${feature.properties.Province || "Unknown"}<br>
                        Bishop Attended: ${bishopAttended || "None"}<br>
                        Earliest Attested Bishop: ${feature.properties.Earliest_Attested_Bishop || "Unknown"}<br>
                        Notes: ${feature.properties.Notes || "None"}`;
                    layer.bindPopup(popupContent);
                
                }
            }).addTo(map);
            
            // if label layer already exists, remove it
            if (labelLayer) map.removeLayer(labelLayer);

            // create new label layer
            labelLayer = L.layerGroup();
            raw_data.features.forEach(feature => {
                if (!feature.geometry || feature.geometry.type !== 'Point') return;

                var [lng, lat] = feature.geometry.coordinates;
                var latlng = [lat, lng];
                var labelText = feature.properties.See || feature.properties.Modern_City || "";

                // invisible marker with permenant tooltip as label
                var m = L.circleMarker(latlng, {
                    pane: 'labels',
                    radius: 0,
                    opacity: 0,
                    fillOpacity: 0,
                    interactive: false
                })
                .bindTooltip(labelText, {
                    permanent: true,
                    direction: 'top',
                    className: "place-label",
                    offset: [0, -6]
                });
                labelLayer.addLayer(m);
            })

            // update label visibility based on zoom
            updateLabelsForZoom();
            
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
    if (bishopLayer) {
        map.removeLayer(bishopLayer);
        bishopLayer = null;
    }

    if (labelLayer && map.hasLayer(labelLayer)) {
        map.removeLayer(labelLayer);
    }
}


// COUNCIL SELECTION CONTROL //
var councilSelectorMenu = L.control({position: 'topright'});

councilSelectorMenu.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'council-selector');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        div.style.padding = '10px';
        div.style.border = '1px solid #000000';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        div.style.font = "Times, serif";
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


// INTRO OVERLAY CONTROL //
document.getElementById('intro-close')?.addEventListener('click', () => {
    var overlay = document.getElementById('intro-overlay');
    if (overlay) overlay.style.display = 'none';
});


// ATTENDANCE STATISTICS BOX CONTROL //
function updateAttendanceStatsBox() {
    const statsBox = document.getElementById('attendance-stats');
    if (!statsBox) return;

    const stats = councilStats[selectedCouncil];
    const councilDisplay = selectedCouncil.replace('_', ' ');

    if (!stats) {
        statsBox.innerHTML = `
            <h3>Record of Attendance: ${councilDisplay}</h3>
            <div class="stats-content">No council statistics available.</div>
        `;
        return;
    }

    const percentPossible = Math.round((stats.percent_possible_signers || 0) * 1000) / 10;

    statsBox.innerHTML = `
        <h3>Record of Attendance: ${councilDisplay}</h3>
        <div class="stats-content">
            <div class="stat-row">
                <span class="stat-label">Total signatories:</span>
                <span class="stat-value">${stats.total_signers}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Unknown signatories:</span>
                <span class="stat-value">${stats.unknown_signers}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Number of attested sees:</span>
                <span class="stat-value">${stats.potential_bishops}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Percent of possible signatories:</span>
                <span class="stat-value">${percentPossible}%</span>
            </div>
        </div>
    `;
}
updateAttendanceStatsBox();

// LEGEND CONTROL //
var legendControl = L.control({position: 'bottomright'});
legendControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
        <h4>Legend</h4>
        <div class="legend-item">
            <span class="legend-symbol legend-diamond">
                <i class="fas fa-diamond"></i>
            </span>
            <span>Attended selected council</span>
        </div>
        <div class="legend-item">
            <span class="legend-symbol legend-circle"></span>
            <span>No attendance for selected council</span>
        </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    return div;
};
legendControl.addTo(map);

/*
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

    // define collapsible description content
    var sections = [
        {
            title: 'Overview',
            html: '<p>This interactive tool visualizes episcopal attendance at twelve Church Councils (deliberative meetings of bishops) in Roman and post-Roman Hispania. The Councils span nearly three centuries, from the Council of Elvira (306 CE) to the Third Council of Toledo (589 CE). Based on research from the dissertation "Wars and Rumors of War: Archaeology, Violence, and the End of Roman Spain," this map allows users to explore the geographic distribution of participating bishoprics for each council, revealing significant patterns in ecclesiastical organization and regional connectivity during the transition from late antiquity to the early medieval period.</p>'
        },
        {
            title: 'How to Use',
            html: '<p>Select a council from the available list to populate the map with markers indicating the sees (episcopal seats) from which bishops are known to have attended. Each marker represents a bishopric whose representative participated in the selected council.</p>'
        },
        {
            title: 'Legend',
            html: '<ul>' +
                '<li><strong>Purple Diamond:</strong> Bishop attended the selected council.</li>' +
                '<li><strong>Orange Circle:</strong> Bishops known to have attended any Iberian council during this period (contextual reference points).</li>' +
                '</ul>'
        },
        {
            title: 'Data Limitations',
            html: '<p>For some historically significant councils, complete subscription lists (official records of attendees with their sees) do not survive. Where possible, likely attendance has been reconstructed based on other historical evidence, but users should be aware that some councils may show incomplete or partially reconstructed data. Not all surviving subscription lists include the specific sees from which bishops traveled, complicating efforts to map attendance comprehensively. We therefore include a marker on the side showing in purple the number of bishops of unknown sees that attended the Council, as well as, in red, the number of conspicuous absences or bishops known to have attended but who did not sign the subscription list (e.g., at the First Council of Toledo, seven bishops were present but condemned for heresy). </p>'
        },
        {
            title: 'Key Findings',
            html: '<p>The data reveals a striking chronological pattern in council attendance:</p>'
        },
        {
            title: 'Sources',
            html: '<p>The episcopal attendance data derives primarily from:</p>' +
                '<h3>Primary Source Collections:</h3>' +
                '<ul>' +
                '<li>Martínez Díez, Gonzalo, and Félix Rodríguez. La colección canónica Hispana. 6 vols. Monumenta Hispaniae Sacra. Madrid, 1966-2002.</li>' +
                '<li>Vives, José. Concilios visigóticos e hispano-romanos. Madrid: Consejo Superior de Investigaciones Científicas, 1963</li>' +
                '</ul>' +
                '<h3>Secondary Analysis:</h3>' +
                '<ul>' +
                '<li>Orlandis, José, and Domingo Ramos-Lissón. Historia de los concilios de la España romana y visigoda. Pamplona: Universidad de Navarra, 1986.</li>' +
                '</ul>'

        }
    ];

    // build sections and append to div
    sections.forEach(function(s, idx) {
        var section = document.createElement('section');
        section.className = 'desc-section';
        section.dataset.index = idx;

        var header = document.createElement('h1');
        header.className = 'desc-header';
        header.innerHTML = s.title + ' <span class="minimize-btn">[+]</span>'; // start collapsed indicator
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        section.appendChild(header);

        var content = document.createElement('div');
        content.className = 'description-content';
        content.innerHTML = s.html;
        content.style.display = 'none'; // starts collapsed
        content.style.marginTop = '10px';
        content.style.marginBottom = '10px';
        section.appendChild(content);

        div.appendChild(section);
    });

    // start hidden
    div.style.display = 'none';

    // prevent map interactions when interacting with the panel
    L.DomEvent.disableClickPropagation(div);

    // toggle individual sections when header or minimize button clicked
    div.addEventListener('click', function(e) {
        var header = e.target.closest('.desc-header');
        if (!header) return;
        var section = header.parentElement;
        if (!section) return;
        var content = section.querySelector('.description-content');
        var btn = header.querySelector('.minimize-btn');
        var isHidden = content.style.display === 'none';

        // toggle specific visibility only for clicked section
        content.style.display = isHidden ? '' : 'none';
        if (btn) btn.textContent = isHidden ? '[-]' : '[+]';
        section.classList.toggle('minimized', !isHidden);
    });

    return div;
};

descriptionMenu.addTo(map);
*/

// END OF SCRIPT //
