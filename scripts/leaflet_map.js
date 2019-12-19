// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// This script is used for the general interaction and loading of the leaflet map as well
// as other functions regarding the map.
var countFilter = 0;
var grouping = L.markerClusterGroup({
	disableClusteringAtZoom: 15,
	spiderfyOnMaxZoom: false
});
var queryTabID = "";

// Init map with open street map as base map over DC area
var map = L.map('mapid', {zoomSnap: .25, wheelPxPerZoomLevel: 120}).setView([38.88971, -77.00894], 12);
map.options.minZoom = 2;

L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 18,
	attribution: '<a href="https://www.doi.gov">U.S. Department of the Interior</a> | <a href="https://www.usgs.gov">U.S. Geological Survey</a> | <a href="https://www.usgs.gov/laws/policies_notices.html">Policies</a>',
	id: 'USGSTopo'
}).addTo(map);

// Add coordinate information
L.control.mousePosition().addTo(map);

// Add ZoomBox control
var options = { position: "topleft" };
var zoom = L.control.zoomBox(options);
map.addControl(zoom);

// NOTE: Subtraction of map offset doesn't seem to have an effects
// set height of afd tabs to height of map
$('#afd-tabs').height($('#mapid').height() - /* minus map offset */ 33);

// ################################# //
// ### Map functions and loading ### //
// ################################# //

// Function to clear the map of data
function clearMap(){
	grouping.clearLayers();
}

// Function to clear all current tabs
function clearTabs(){
	$('#afd-tabs ul li').remove();
	$('#afd-tabs div').remove();
	// Not sure if below line is depreciated or what. Tabs list seems to refresh without it
	$("#afd-tabs").tabs("refresh");
}

// Function to "Expand" query writing area
function qWrite_show(){
	document.getElementById('qWritePopup').style.display = "block";
}

// Function to Hide query writing area
function qWrite_hide(){
	document.getElementById('qWritePopup').style.display = "none";
}

// Function to zoom to pre-defined locations around the map
function zoomMapToLocation(loc, lat, long) {
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
		map.setView([lat, long], 12);
	}
}

// Inserts an element after a referenced one.
function insertAfter(el, referenceNode) {
	referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
}