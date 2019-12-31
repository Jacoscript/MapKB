// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for opening/closing/displaying the ontology
// instance viewer as well as populating it with objects from ontologies.

// Global variables
var canvas_instance_viewer;
var canvas_ctx;

function mainInstanceViewer() {
    // TODO: Will be deleted due to Ontologies tab opening instance viewer
    openInstanceViewer();
}

function openInstanceViewer() {
    setupInstanceViewer(5);
}

// ############ //
// Canvas setup //
// ############ //

function setupInstanceViewer(num_objs_for_inst) {
    canvas_instance_viewer = $("#instance-viewer");
    canvas_ctx = canvas_instance_viewer[0].getContext("2d");
    canvas_ctx.fillStyle = "white";
    canvas_ctx.fillRect(0, 0, canvas_ctx.canvas.width, canvas_ctx.canvas.height);

    // Create objects and their locations based on the number of objects
    switch (num_objs_for_inst) {
        case 0:
            break;
        case 1:
            drawCircleForObject(2, 2);  // Center object
            break;
        case 2:
            drawCircleForObject(2, 2);  // Center object
            drawCircleForObject(3, 3);  // Top left
            break;
        case 3:
            drawCircleForObject(2, 2);  // Center object
            drawCircleForObject(3, 3);  // Top left
            drawCircleForObject(1.5, 3);  // Top right
            break;
        case 4:
            drawCircleForObject(2, 2);  // Center object
            drawCircleForObject(3, 3);  // Top left
            drawCircleForObject(1.5, 3);  // Top right
            drawCircleForObject(3, 1.5);  // Bottom left
            break;
        case 5:
            drawCircleForObject(2, 2);  // Center object
            drawCircleForObject(3, 3);  // Top left
            drawCircleForObject(1.5, 3);  // Top right
            drawCircleForObject(3, 1.5);  // Bottom left
            drawCircleForObject(1.5, 1.5);  // Bottom right
            break;
    }
}

// ######################## //
// Canvas drawing functions //
// ######################## //

function drawCircleForObject(width_division, height_division) {
    canvas_instance_viewer = $("#instance-viewer");
    canvas_ctx = canvas_instance_viewer[0].getContext("2d");
    canvas_ctx.beginPath();
    canvas_ctx.arc(canvas_ctx.canvas.width / width_division, canvas_ctx.canvas.height / height_division, 10, 0, 2 * Math.PI);
    canvas_ctx.stroke();
}

$(document).ready(function() {
	mainInstanceViewer();
});