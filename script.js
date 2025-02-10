//LAUNCHING THE MAP
//declare the map
var map = L.map('map').setView([37.5, -80], 6);

//add tile layer from CAWM
L.tileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {
          }).addTo(map);