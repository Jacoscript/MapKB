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
        $("#policiesAndContributions").css("display", "block");
        $("#resetViewOntologyOption").css("display", "block");
        $("#sliderOntologyOption").css("display", "block");
        toggle_viewer = true;
    } else {
        $("#mapid").css("display", "block");
        $(".svgGraph").css("display", "none");
        $("#example").css("display", "none");
        $("#graph").css("display", "none");
        $("#policiesAndContributions").css("display", "none");
        $("#resetViewOntologyOption").css("display", "none");
        $("#sliderOntologyOption").css("display", "none");
        toggle_viewer = false;
    }
}

$(document).ready(function() {
    // Create toggle buttons for leaflet and ontology views
    $("#resetViewOntologyOption").append("<span class=\"btnOntology\" id=\"btnResetOntology\" onclick=\"resetGraph();\">Reset</span>")
    $("#toggleLeafletOption").append("<span class=\"btnOntology\" id=\"btnToggleLeaflet\" onclick=\"toggleOntologyViewer();\">Toggle Leaflet Viewer</span>")
    $("#toggleOntologyOption").append("<span class=\"btnLeaflet\" id=\"btnToggleOntology\" onclick=\"toggleOntologyViewer();\">Toggle Ontology Viewer</span>")

    // Finish setting up leaflet view
    $("#resetViewLeafletOption").append("<span class=\"btnLeaflet\" id=\"btnResetLeafletView\" onclick=\"zoomMapToLocation('Initial');\">Reset View</span>")

    // Display leaflet/USGS info and policies from leaflet map onto ontology map as well
    $("#policiesAndContributions").append("<a href=\"http://leafletjs.com\" target=\"_blank\" title=\"A JS library for interactive maps\">Leaflet</a> | ")
    $("#policiesAndContributions").append("<a href=\"http://vowl.visualdataweb.org/webvowl.html\" target=\"_blank\">WebVOWL</a> | ")
    $("#policiesAndContributions").append("<a href=\"http://doi.gov\" target=\"_blank\">U.S. Department of the Interior</a> | ")
    $("#policiesAndContributions").append("<a href=\"http://usgs.gov\" target=\"_blank\">U.S. Geological Survey</a> | ")
    $("#policiesAndContributions").append("<a href=\"http://usgs.gov/laws/policies_notices.html\" target=\"_blank\">Policies</a>")
});