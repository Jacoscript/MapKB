// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// marker system within the menu/leaflet map.

var userMarkers = [];
var userMarkersBuilder = {};

function pageLoadMarkers() {
    // Function that runs after the page loads
}

function addMarker() {
    // Function that adds a user's specific markers to the map
    // Note: Marker lat/long may be referenced by user input or a reticle
    //       on the map. Not sure which approach will be taken yet.
    var lat, long;
    var ref_name = "";
    var zoom_level = 12;  // Default is 12

    // Get information and error check
    var user_Info = prompt("Please give the marker a name:", "Marker name");
    while (user_Info == "" || user_Info == "Marker name") {
        user_Info = prompt("Please give the marker a name:", "Marker name");
    }
    if (user_Info == null) {
        addToNotificationQueue("Error", "Marker 'user_Info' is null.")
        return;
    }

    var locale = map.getCenter();  // Map center

     // Marker icon location: leaflet/images/marker-icon.png or marker-icon-2x.png
     var map_marker = L.marker([locale.lat, locale.lng]).addTo(map);

     // Set marker tooltip info to marker name
     map_marker.bindTooltip(user_Info, {className: 'marker-CSS', direction: 'top', offset: L.point({x: 0, y: -11})});

    // Set up object
    userMarkersBuilder = {
        markerName: user_Info,
        markerLat: locale.lat,
        markerLong: locale.lng,
        markerIcon: map_marker,
        markerZoom: map.getZoom()
    };

    // Log
    console.log("New Marker '" + user_Info + "' at (lat: " + locale.lat + ", long: " + locale.lng + ")");
    
    // Add marker to list for later deletion
    userMarkers.push(userMarkersBuilder);
    
    // Add marker to the html ul, sub-del-marker, as well as sub-markers
    // Note: Marker name is passed to the del-marker function so that the 
    // Note: function can know which marker to delete when selected.
    $("#sub-del-marker").append("<a href=\"#\" onclick=\"delMarker('" 
    + userMarkersBuilder.markerName + "');\">" + userMarkersBuilder.markerName + "</a>");

    $("#sub-markers").append("<a href=\"#\" onclick=\"zoomMapToLocation('User Marker', '" 
    + userMarkersBuilder.markerLat + "', '" + userMarkersBuilder.markerLong 
    + "', '" + userMarkersBuilder.markerZoom +"');\">" + userMarkersBuilder.markerName + "</a>");
}

function clrMarker() {
    // Function to clear all markers from map
    
    // Remove marker icons from map
    for (var i = 0; i < userMarkers.length; i++) {
        map.removeLayer(userMarkers[i].markerIcon);
    }
    userMarkers = [];
	// Remove html of sub-tabs for add-markers and del-markers
    $('#sub-del-marker a').remove();
    $('#sub-markers a').remove();
}

function delMarker(refName) {
    // Function to delete a user's specific marker from the map

    for (var i = userMarkers.length - 1; i >= 0; i--) {
        if (userMarkers[i].markerName == refName) {
            // Delete marker icon
            map.removeLayer(userMarkers[i].markerIcon);
            // Delete marker
            userMarkers.splice(i ,1);
            // Delete specifc dropdowns
            $("#sub-del-marker a").filter(":contains('" + refName + "')").remove()
            $("#sub-markers a").filter(":contains('" + refName + "')").remove()
        }
    }
}


$(document).ready(function() {
    pageLoadMarkers();
});