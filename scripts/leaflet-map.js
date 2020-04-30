// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// This script is used for the general interaction and loading of the leaflet
//  map as well as other functions regarding the map.

var countFilter = 0;  // TODO: Is this depreciated?
var created_leaflet_objects = [];  // List of all current user created leaflet draw obects
var grouping = L.markerClusterGroup({
	disableClusteringAtZoom: 15,
	spiderfyOnMaxZoom: false
});
var height_main_container = $('#main-container').height();  // Used for other containers' measurements
var leaflet_draw_finished = false;  // TODO: May not need. 
var leaflet_version = '';  // Current leaflet version being used
var query_tab_id;  // Current query tab being display (somewhat depreciated/not working atm)

// ######################### //
// ### Leaflet Map Setup ### //
// ######################### //

// Init map with open street map as base map over DC area
var map = L.map('mapid', {zoomSnap: .25, wheelPxPerZoomLevel: 120}).setView([38.88971, -77.00894], 12);  // Add drawControl: true if you don't want editable draw layers
map.options.minZoom = 2;

L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 16,
	attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> '
				 + '| <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a> | <a href="http://vowl.visualdataweb.org/v2/">VOWL</a>',
	id: 'USGSTopo'
}).addTo(map);


// Add leaflet draw functionality to the map
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

// Add edit toolbar
// FeatureGroup is to store editable layers
var drawControl = new L.Control.Draw({
	edit: {
		featureGroup: editableLayers
	}
});

map.addControl(drawControl);

// Saves user created geometry from the leaflet draw plugin to the map
map.on(L.Draw.Event.CREATED, function (e) {
	var type = e.layerType,
		layer = e.layer;

	if (type === 'marker') {
		// TODO: Get user input on what they want the marker popup to say
		layer.bindPopup('A popup!');
	}

	console.log('User created geomtry has been saved to the leaflet map.');
	editableLayers.addLayer(layer);
});

// Below lines are depreciated as they don't have editable layers.

// var MyCustomMarker = L.Icon.extend({
// 	options: {
// 		shadowUrl: null,
// 		iconAnchor: new L.Point(12, 12),
// 		iconSize: new L.Point(24, 24),
// 		iconUrl: 'link/to/image.png'
// 	}
// });

// var options = {
// 	position: 'bottomleft',
// 	draw: {
// 		polyline: {
// 			shapeOptions: {
// 				color: '#f357a1',
// 				weight: 10
// 			}
// 		},
// 		polygon: {
// 			allowIntersection: false, // Restricts shapes to simple polygons
// 			drawError: {
// 				color: '#e1e100', // Color the shape will turn when intersects
// 				message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
// 			},
// 			shapeOptions: {
// 				color: '#bada55'
// 			}
// 		},
// 		circle: false, // Turns off this drawing tool
// 		rectangle: {
// 			shapeOptions: {
// 				clickable: false
// 			}
// 		},
// 		marker: {
// 			icon: new MyCustomMarker()
// 		}
// 	},
// 	edit: {
// 		featureGroup: editableLayers, //REQUIRED!!
// 		remove: false
// 	}
// };

// Note: depreciated lines below
// var drawControl = new L.Control.Draw(options);
// map.addControl(drawControl);

leaflet_version = L.version; // Current is 1.6.0

// Add coordinate information
L.control.mousePosition().addTo(map);

// Add ZoomBox control
var options = { position: "topleft" };
var zoom = L.control.zoomBox(options);
map.addControl(zoom);

// ################################ //
// ### Special Leaflet Handling ### //
// ################################ //

// When the map moves we run our function below
map.on('move', onMapMove);
 
// Boilerplate
map.on('locationerror', onLocationError);

// ################################# //
// ### Map Functions and Loading ### //
// ################################# //

function clearMap(){
	console.log("Clearing map.");
	// Function to clear the map of data
	grouping.clearLayers();

	// Set all triggers to false
	for (key of Object.keys(triggerLayers)) {
		triggerLayers[key] = false;
	}
}

function clearTabs(){
	// Function to clear all current tabs

	console.log("Clearing tabs.");
	$('.qb-widget-tab').remove();
	
	// Reset query vars
	current_custom_queries = 0;
	query_tab_list = [];
}

function insertAfter(el, referenceNode) {
	// Inserts an element after a referenced one.

	referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}

function onLayerLoading(input_query) {
	// A function to disable web page features while a specific layer is
	// loaded

	if (input_query != "") {
		console.log("[Loading]: Layer - " + input_query);
	}
	// Set loading cursor for all
	$("#loading-layer-overlay").css("display", "block");
}

function onLayerLoadingFinished(input_query) {
	// A function to enable the web page after a specific layer is loaded.
	if(input_query == "doSomething") {
		triggerLayers["doSomething"] == false;
	}

	if (input_query != "") {
		console.log("[Loading]: Layer - " + input_query + " finished.");
	}
	$("#loading-layer-overlay").css("display", "none");
}

function onLocationError(e) {
	alert(e.message);
}

function onMapMove() {
	// Function to add center of map lat/long information and update the 
	// afd tabs to the appropriate height

	var locale = map.getCenter();
	$("#txtbox-Latitude").val(locale.lat);
	$("#txtbox-Longitude").val(locale.lng);
	
	// Set height of main container to negate the navbar
	// NOTE: fix below line for mobile.
	$('#main-container').height(height_main_container - ($('.navbar').height() + 16));  // 16 = navbar padding
};

function zoomMapToLocation(loc, lat, long, zoomLevel) {
	// Function to zoom to pre-defined locations around the map
	if (loc == 'Initial'){
		map.setView([38.8897547, -77.0089138], 12);
	} else if (loc == 'US Capitol') {
		map.setView([38.8897547, -77.0089138], 15);
	} else if (loc == 'Reflecting Pool') {
		map.setView([38.8893298, -77.0445652], 15);
	} else if (loc == 'McMillan Reservoir') {
		map.setView([38.9248438, -77.0169079], 15);
	} else if (loc == 'DC FEMS Engine 19') {
		map.setView([38.87161, -76.96695], 16);
	} else if (loc == 'User Marker') {
		// Used with the markers.js functions regarding addMarkers. A user is
		// able to add their own markers and is connected to the map via this
		// function
		if (zoomLevel == null) {
			map.setView([lat, long], 12);
		} else {
			map.setView([lat, long], zoomLevel);
		}
	}
}

$(document).ready(function() {
	// Update lat long on first onLoad of web page
	onMapMove();
});