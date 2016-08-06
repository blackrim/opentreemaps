var layer = new L.StamenTileLayer('toner-background');

//var map = new L.Map('map').setView([44.75,-86],7);
var map = new L.Map('map', {
	center: [44.75,-86],
	zoomControl:false,
	zoom: 7,
	minZoom: 7,
	maxZoom: 16
})

map.addLayer(layer);

map.addControl(new L.Control.ZoomMin());


function setColorDIV(population) {
	var d = parseInt(population)
	return d > 1500 ? '#005824' :
           d > 1000  ? '#238b45' :
           d > 750  ? '#41ae76' :
           d > 500  ? '#66c2a4' :
           d > 250   ? '#99d8c9' :
           d > 100   ? '#ccece6' :
           d > 50   ? '#edf8fb' :
                      '#FFF';
}

function setColorPD(population) {
	var d = parseInt(population)
	return d > 3500 ? '#FF0000' :
           d > 3000  ? '#FF3300' :
           d > 2500  ? '#FF6600' :
           d > 2000  ? '#FF9900' :
           d > 1500   ? '#FFCC00' :
           d > 1000   ? '#FFFF00' :
           d > 500   ? '#FFFF99' :
                      '#FFF';
}

// Styles for each county on the map
// With this, we grab each county's population
// And send it to the setColor function above
function setStyle(feature) {
	return {
		opacity: 1,
		weight: 2,
		color: "#FFF",
		dashArray:'3',
		fillColor: setColorPD(feature.properties.diversity),
		fillOpacity: 0.8
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
	style: setStyle,
	onEachFeature: onEachFeature
}).addTo(map);

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
        : 'Hover over a county');
};

info.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        //grades = [1, 50, 100, 250, 500, 750, 1000, 1500],
        grades = [1, 500, 1000, 1500, 2000, 2500, 3000, 3500],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + setColorPD(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
