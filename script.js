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

        //set starting council to Elivra 306
        var selectedCouncil = 'Elvira 306';

        //declare custom control
        var councilSelectorMenu = L.control.custom({
        position: 'topright',
        content: '<div class="custom-control">' +
        '<h1>Select Council</h1>' +
        '<br>'+
        '<select onchange="handleDropdownChange(this)">' +
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
        '</select>' +
        '</div>',
        classes: 'custom-control'
        });

        // Add the custom control to the map
        councilSelectorMenu.addTo(map);

        function handleDropdownChange(select) {
            //reset selectedCouncil
            selectedCouncil = select.value;    
        }
            })    
        .catch(error => {
            console.error(error);})

        //HANDLEDROPDOWNCHANGE
        //define the handleDropdownChange function
        