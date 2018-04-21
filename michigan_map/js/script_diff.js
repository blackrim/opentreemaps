// Call Stamen tiles
var layer = new L.StamenTileLayer('toner-background');

// Initialize our map
// The first setview parameter is the lat, long
// Of the initial zoom
// The second parameter is the zoom level
var map = new L.Map('map', {
	center: [44.75,-86],
	zoomControl:true,
	zoom: 7,
	minZoom: 7,
	maxZoom: 16
})

map.addLayer(layer);

L.easyButton( 'fa-globe', function(){
  map.setView([44.75,-86], 4);
}).addTo(map);


// Set the color of the individual county
// All colors are shades of green
// The more population, the darker the county will appear on the map
function setColorDIV(population) {
	var d = parseInt(population)
	return d > 600 ? '#39ac39' :
           d > 400  ? '#79d279' :
           d > 200  ? '#b3e6b3' :
           d > 0  ? '#ecf9ec' :
           d > -200   ? '#FF7676' :
           d > -400   ? '#FF3F3F' :
           d > -600   ? '#FF0000' :
           d > -1000   ? '#FF0000' :
                      '#FFF';
}

function setColorPD(population) {
	var d = parseInt(population)
	return d > 30000 ? '#0068FF' :
           d > 20000  ? '#388AFF' :
           d > 10000  ? '#74ADFE' :
           d > 0  ? '#AACDFF' :
           d > -10000   ? '#FF7676' :
           d > -20000   ? '#FF3F3F' :
           d > -30000   ? '#FF0000' :
                      '#FFF';
}

// Styles for each county on the map
// With this, we grab each county's population
// And send it to the setColor function above
function setStylePD(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#FFF",
		dashArray:'3',
		fillColor: setColorPD(feature.properties.diversity),
		fillOpacity: 0.8
	}
}

function setStyleDIV(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#FFF",
		dashArray:'3',
		fillColor: setColorDIV(feature.properties.population),
		fillOpacity: 0.8
	}
}

function setStyleDEF(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#FFF",
		dashArray:'3',
	}
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: 3,
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var layer = e.target;
    n = layer.feature.properties.name.split(' ')[0];//.toLowerCase();
    document.getElementById('div_man').innerHTML='<object class=inner type="text/html" data="countydata/'+n+'.html" ></object>';
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Call the GeoJSON file ia-counties
// Which is in a variable called iowa_counties
// And add to the map
var geojson;
// ... our listeners
 geojson = L.geoJson(mi_counties, {
 	style: setStyleDEF,
// 	onEachFeature: onEachFeature
 }).addTo(map);


var toggled = L.easyButton( '<span class="star" title="toggle diversity">D</span>', function(){
	map.removeLayer(geojson);
  	geojson = L.geoJson(mi_counties, {
		style: setStyleDIV,
		onEachFeature: onEachFeature
		}).addTo(map);
	legendPD.removeFrom(map);
	legendDIV.addTo(map);
});
toggled.addTo(map);

var toggledp = L.easyButton( '<span class="star" title="toggle phylo diversity">P</span>', function(){
	map.removeLayer(geojson);
  	geojson = L.geoJson(mi_counties, {
		style: setStylePD,
		onEachFeature: onEachFeature
		}).addTo(map);
	legendDIV.removeFrom(map);
	legendPD.addTo(map);
});
toggledp.addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>County Plant Diversity</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.population + ' species' + 
        '<br />'+props.diversity+' phylo div (no BL)</sup>'
        : 'Click "D" for diversity or <br > "P" for phylo diversity <br />and hover over a county');
};

info.addTo(map);

var legendPD = L.control({position: 'bottomright'});
legendPD.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [40000,30000,20000,10000, 1, -10000, -20000, -30000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + setColorPD(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

var legendDIV = L.control({position: 'bottomright'});

legendDIV.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [900, 600, 300, 1, -300, -600, -900],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + setColorDIV(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};


legendPD.addTo(map);



