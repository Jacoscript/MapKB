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
    var refName = "";

    // Get information
    var userInfo = prompt("Please give the marker a name:", "Marker name");
    if (userInfo == null || userInfo == "" || userInfo == "Marker name") {
        userInfo = prompt("Please give the marker a name:", "Marker name");
    } else {
        refName = userInfo;
        lat = prompt("Please give the marker latitude:", "0");
        long = prompt("Please give the marker longitude:", "0");
    }

    // Set up object
    userMarkersBuilder = {
        markerName: refName,
        markerLat: lat,
        markerLong: long
    };

    // Add marker to list for later deletion
    userMarkers.push(userMarkersBuilder);

    // Add marker to the html ul, sub-del-marker, as well as sub-markers
    $("#sub-del-marker").append("<a href=\"#\" onclick=\"delMarker('" 
    + userMarkersBuilder.markerName + "');\">" + userMarkersBuilder.markerName + "</a>");
    $("#sub-markers").append("<a href=\"#\" onclick=\"zoomMapToLocation('User Marker', '" 
    + userMarkersBuilder.markerLat + "', '" + userMarkersBuilder.markerLong + "');\">"
    + userMarkersBuilder.markerName + "</a>");
}

// Function to clear all markers from map
function clrMarker() {
	userMarkers = [];
	// TODO: Remove html of sub-tabs for add-markers and del-markers
    $('#sub-del-marker a').remove();
    $('#sub-markers a').remove();
}

// TODO: Function to delete a user's specific marker from the map
function delMarker(refName) {
    
}


$(document).ready(function() {
    pageLoadMarkers();
});