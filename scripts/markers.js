// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// marker system within the menu/leaflet map.

var userMarkers = [];
var userMarkersBuilder = {};

function pageLoadMarkers(jQuery) {
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
    var userInfo = prompt("Please give the marker a name:", "Marker name");
    console.log("User Info: " + userInfo);
    while (userInfo == "" || userInfo == "Marker name") {
        userInfo = prompt("Please give the marker a name:", "Marker name");
    }
    if (userInfo == null) {
        addToNotificationQueue("Error", "Marker 'userInfo' is null.")
        return;
    }

    var locale = map.getCenter();  // Map center
        ref_name = userInfo;
        lat = locale.lat;
        long = locale.lng;
        zoom_level = map.getZoom();

    // Set up object
    userMarkersBuilder = {
        markerName: ref_name,
        markerLat: lat,
        markerLong: long,
        markerZoom: zoom_level
    };

    // Add marker to list for later deletion
    userMarkers.push(userMarkersBuilder);
    
    // TODO: Add marker icon to map

    // Add marker to the html ul, sub-del-marker, as well as sub-markers
    // Note: marker name is passed to the del-marker function so that the 
    // function can know which marker to delete when selected.
    $("#sub-del-marker").append("<a href=\"#\" onclick=\"delMarker('" 
    + userMarkersBuilder.markerName + "');\">" + userMarkersBuilder.markerName + "</a>");

    $("#sub-markers").append("<a href=\"#\" onclick=\"zoomMapToLocation('User Marker', '" 
    + userMarkersBuilder.markerLat + "', '" + userMarkersBuilder.markerLong 
    + "', '" + userMarkersBuilder.markerZoom +"');\">" + userMarkersBuilder.markerName + "</a>");
}

function clrMarker() {
    // Function to clear all markers from map
	userMarkers = [];
	// Remove html of sub-tabs for add-markers and del-markers
    $('#sub-del-marker a').remove();
    $('#sub-markers a').remove();

    // TODO: remove marker icons from map
}

function delMarker(refName) {
    // Function to delete a user's specific marker from the map
    for (var i = userMarkers.length - 1; i >= 0; i--) {
        if (userMarkers[i].markerName == refName) {
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