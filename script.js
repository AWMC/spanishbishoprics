//LAUNCHING THE MAP
//declare the map
var map = L.map('map').setView([40, -5], 6);
 
//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {}).addTo(map);
 
//add geoJSON data
fetch("attendance-geodata.geojson")
.then(response => {
    if (!response.ok) return;
    return response.json();
})
.then(raw_data => {
    L.geoJSON(raw_data).addTo(map);
})
.catch(error => {
    console.error(error);
})
 