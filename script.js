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
        L.geoJSON(raw_data, {
            //add vector appearance
            pointToLayer: function(feature, latlng) {
                if (feature.properties.attendance == true) { //HELP! How do I reference all attendance when they have different names!!
                }
                return L.circleMarker(latlng, {
                    radius : 5,         //set size adjustment
                    color : "black",    //set outline color
                    fillColor : "black",//set fill color
                    fillOpacity : 0.5,  //set transparency
                    weight : 1          //set outline thickness   
                });
            }, 
            //add popups
            onEachFeature: function(feature, layer) {  
                //customize popup content
                var popupContent = 
                    `<b>${feature.properties.See}</b><br>
                    Province: ${feature.properties.Province || "Unknown"}<br>
                    Notes: ${feature.properties.Notes || "None"}`;
                layer.bindPopup(popupContent);
        }}).addTo(map);
    })
.catch(error => {
    console.error(error);
})