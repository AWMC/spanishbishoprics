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
 
//add vector appearance (point)
const bishoprics = [
    { name: "Felix", lat: 37.299552, lon: -3.137125, attended: true },
];

bishoprics.forEach((bishopric) => {
    L.circleMarker([bishopric.lat, bishopric.lon], {
        color: bishopric.attended ? "green" : "red", // Green if attended, red if not
        fillColor: bishopric.attended ? "green" : "red",
        fillOpacity: 0.7,
        radius: bishopric.attended ? 8 : 4, // Larger for attended
    })
    .bindTooltip(bishopric.name, { permanent: false, direction: "top" }) // Info box on hover
    .addTo(map);
});

//add popups
const infoBox = document.getElementById("info-box");

bishoprics.forEach((bishopric) => {
    const marker = L.circleMarker([bishopric.lat, bishopric.lon], {
        color: bishopric.attended ? "green" : "red",
        fillColor: bishopric.attended ? "green" : "red",
        fillOpacity: 0.7,
        radius: bishopric.attended ? 8 : 4,
    }).addTo(map);

    // Show info on hover
    marker.on("mouseover", function () {
        infoBox.style.display = "block";
        infoBox.innerHTML = `<b>${bishopric.name}</b><br>Attended: ${bishopric.attended ? "Yes" : "No"}`;
    });

    // Hide info when the mouse leaves
    marker.on("mouseout", function () {
        infoBox.style.display = "none";
    });
});

//add legend