var   graphTag = document.getElementById('graph')
    , linkDistanceClassSlider
    , linkDistanceClassLabel
    , linkDistanceLiteralLabel
    , linkDistanceLiteralSlider
    , onLoadCalled = false;
// Set the default graph data
var jsonURI = "foaf_spec";

var graphOptions = function graphOptionsFunct() {

    var sliderOption = document.getElementById('sliderOntologyOption');

    var slidDiv = d3.select(sliderOption)
        .append("div")
        .attr("id", "distanceSlider");

    linkDistanceClassLabel = slidDiv.append("label")
        .attr("for", "distanceSlider")
        .text(DEFAULT_VISIBLE_LINKDISTANCE);
    linkDistanceClassLabel.style({"margin-top": "3.5px", "position": "absolute"});
    linkDistanceLiteralLabel = linkDistanceClassLabel;

    linkDistanceClassSlider = slidDiv.append("input")
        .attr("type", "range")
        .attr("min", 10)
        .attr("max", 600)
        .attr("value", DEFAULT_VISIBLE_LINKDISTANCE)
        .attr("step", 10)
        .on("input", changeDistance);
    linkDistanceClassSlider.style({"margin-left": "30px", "position": "absolute"});
    linkDistanceLiteralSlider = linkDistanceClassSlider;
};

var loadGraph = function loadGraphFunct() {
    var height = 600
      , width = document.getElementById("example").offsetWidth;

    d3.json("ontologies/examples/" + jsonURI + ".json", function(error, data) {
        json = data;
        drawGraph(graphTag, width, height);
    });
};

var onload = function onloadFunct() {
    // Prevent multiple executions of the onload function
    if (onLoadCalled) {
        return;
    }
    onLoadCalled = true;
    loadGraph();
};
document.onload = onload();