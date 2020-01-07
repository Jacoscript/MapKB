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
        $("#resetOption").css("display", "block");
        $("#sliderOption").css("display", "block");
        toggle_viewer = true;
    } else {
        $("#mapid").css("display", "block");
        $(".svgGraph").css("display", "none");
        $("#example").css("display", "none");
        $("#graph").css("display", "none");
        $("#resetOption").css("display", "none");
        $("#sliderOption").css("display", "none");
        toggle_viewer = false;
    }
}

$(document).ready(function() {
    // Create toggle buttons for leaflet and ontology views
    $("#resetOption").append("<span class=\"btnOntology\" id=\"btnResetOntology\" onclick=\"resetGraph();\">Reset</span>")
    $("#toggleLeafletOption").append("<span class=\"btnOntology\" id=\"btnToggleLeaflet\" onclick=\"toggleOntologyViewer();\">Toggle Leaflet Viewer</span>")
    $("#toggleOntologyOption").append("<span class=\"btnLeaflet\" id=\"btnToggleOntology\" onclick=\"toggleOntologyViewer();\">Toggle Ontology Viewer</span>")

    // Finish setting up leaflet view
    $("#resetViewLeafletOption").append("<span class=\"btnLeaflet\" id=\"btnResetLeafletView\" onclick=\"zoomMapToLocation('Initial');\">Reset View</span>")
});