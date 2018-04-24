// Call Stamen tiles
var layer = new L.StamenTileLayer('toner-background');

// Initialize our map
// The first setview parameter is the lat, long
// Of the initial zoom
// The second parameter is the zoom level
var map = new L.Map('map', {
	center: [44.75,-85.5],
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
	return d > 130 ? '#003434' :
           d > 110  ? '#006666' :
           d > 90  ? '#009999' :
           d > 70  ? '#33CCCC' :
           d > 50   ? '#66FFFF' :
           d > 30   ? '#99FFFF' :
           d > 10   ? '#CCFFFF' :
                      '#FFF';
}

function setColorPD(population) {
	var d = parseInt(population)
	return d > 30000 ? '#FF0000' :
           d > 25000  ? '#FF3300' :
           d > 20000  ? '#FF6600' :
           d > 15000  ? '#FF9900' :
           d > 10000   ? '#FFCC00' :
           d > 5000   ? '#FFFF00' :
           d > 1000   ? '#FFFF99' :
                      '#FFF';
}

// Styles for each county on the map
// With this, we grab each county's population
// And send it to the setColor function above
function setStylePD(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#999",
		dashArray:'3',
		fillColor: setColorPD(feature.properties.diversity),
		fillOpacity: 0.8
	}
}

function setStyleDIV(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#888",
		dashArray:'3',
		fillColor: setColorDIV(feature.properties.population),
		fillOpacity: 0.8
	}
}

function setStyleDEF(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#888",
		dashArray:'3',
	}
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#888',
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
        //grades = [1, 50, 100, 250, 500, 750, 1000, 1500],
        grades = [1, 1000, 5000, 10000, 15000, 20000, 25000, 30000],
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
        grades = [1, 10, 30, 50, 70, 90, 110, 130],
        //grades = [1, 500, 1000, 1500, 2000, 2500, 3000, 3500],
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



