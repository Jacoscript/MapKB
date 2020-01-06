// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for opening/closing/displaying the ontology
// instance viewer as well as populating it with objects from ontologies.

function Canvas_Object() {
    // Var for relation to html instance-viewer
    this.html_canvas = $("#ontology-viewer");
    // Var for drawing to canvas of instance-viewer
    this.canvas_ctx = this.html_canvas[0].getContext("2d");

    // ############ //
    // Canvas setup //
    // ############ //

    this.setupOntologyViewer = function () {
        // A function to create all objects and their relations between each
        // other within a canvas (instance viewer)

        this.canvas_ctx.fillStyle = "white";
        this.canvas_ctx.fillRect(0, 0, this.canvas_ctx.canvas.width, 
            this.canvas_ctx.canvas.height);
        
        // Display ontology viewer
        $(".ontology-container").css("display", "block");
    };
};

function createOntologyViewer() {
    cObj = new Canvas_Object();
    cObj.setupOntologyViewer();
}

$(document).ready(function() {

});