// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for opening/closing/displaying the ontology
// viewer. Population of data involves specVOWL.js and webVOWLGraph.js.

toggle_viewer = false;

function toggleOntologyViewer() {
    // A function that switches between displaying the leaflet map and the
    // ontology view

    if (toggle_viewer == false) {
        $("#mapid").css("display", "none");
        $(".svgGraph").css("display", "block");
        $("#example").css("display", "block");
        $("#graph").css("display", "block");
        $("#policies-and-contributions").css("display", "block");
        $("#reset-view-ontology-option").css("display", "block");
        $("#slider-ontology-option").css("display", "block");
        toggle_viewer = true;
    } else {
        $("#mapid").css("display", "block");
        $(".svgGraph").css("display", "none");
        $("#example").css("display", "none");
        $("#graph").css("display", "none");
        $("#policies-and-contributions").css("display", "none");
        $("#reset-view-ontology-option").css("display", "none");
        $("#slider-ontology-option").css("display", "none");
        toggle_viewer = false;
    }
}

$(document).ready(function() {
    // Create toggle buttons for leaflet and ontology views
    $("#reset-view-ontology-option").append("<span class=\"btn-ontology\" id=\"btn-reset-ontology\" onclick=\"resetGraph();\">Reset</span>")
    $("#toggle-leaflet-option").append("<span class=\"btn-ontology\" id=\"btn-toggle-leaflet\" onclick=\"toggleOntologyViewer();\">Toggle Leaflet Viewer</span>")
    $("#toggle-ontology-option").append("<span class=\"btn-leaflet\" id=\"btn-toggle-ontology\" onclick=\"toggleOntologyViewer();\">Toggle Ontology Viewer</span>")

    // Finish setting up leaflet view
    $("#reset-view-leaflet-option").append("<span class=\"btn-leaflet\" id=\"btn-reset-leaflet-view\" onclick=\"zoomMapToLocation('Initial');\">Reset View</span>")

    // Display leaflet/USGS info and policies from leaflet map onto ontology map as well
    // NOTE: All below html elements are hidden at the time of creation. Only when switched to the ontology view will these elements popup.
    $("#policies-and-contributions").append("<a href=\"http://leafletjs.com\" target=\"_blank\" title=\"A JS library for interactive maps\">Leaflet</a> | ")
    $("#policies-and-contributions").append("<a href=\"http://vowl.visualdataweb.org/webvowl.html\" target=\"_blank\">WebVOWL</a> | ")
    $("#policies-and-contributions").append("<a href=\"http://doi.gov\" target=\"_blank\">U.S. Department of the Interior</a> | ")
    $("#policies-and-contributions").append("<a href=\"http://usgs.gov\" target=\"_blank\">U.S. Geological Survey</a> | ")
    $("#policies-and-contributions").append("<a href=\"http://usgs.gov/laws/policies_notices.html\" target=\"_blank\">Policies</a>")
});