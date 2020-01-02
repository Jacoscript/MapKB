// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for opening/closing/displaying the ontology
// instance viewer as well as populating it with objects from ontologies.

function Canvas_Object() {
    // Var for relation to html instance-viewer
    this.html_canvas = $("#instance-viewer");
    // Var for drawing to canvas of instance-viewer
    this.canvas_ctx = this.html_canvas[0].getContext("2d");
    this.createInstanceViewer = function (amount_objects) {
        // A function to setup the instance viewer as well as pull data for
        // all the objects and relations between said objects for the instance
        // viewer to display
        this.setupInstanceViewer(amount_objects);

        // TODO: Create data pull for instance information and relations

    };

    // ############ //
    // Canvas setup //
    // ############ //

    this.setupInstanceViewer = function (num_objs_for_inst) {
        // A function to create all objects and their relations between each
        // other within a canvas (instance viewer)

        this.canvas_ctx.fillStyle = "white";
        this.canvas_ctx.fillRect(0, 0, this.canvas_ctx.canvas.width, 
            this.canvas_ctx.canvas.height);

        // Create objects and their locations based on the number of objects
        // NOTE: 360 / n = degrees between objects
        // NOTE: 1 object is the main object of the instance
        var tier_1_obj_limit = 10
        if (num_objs_for_inst > tier_1_obj_limit) {
            var tier_1_degrees_between_objs = 360 / tier_1_obj_limit;
            var tier_2_degrees_between_objs = 360 
                / (num_objs_for_inst - tier_1_obj_limit);
        } else {
            var tier_1_degrees_between_objs = 360 / num_objs_for_inst;
            var tier_2_degrees_between_objs = 360 / num_objs_for_inst;
        }
        if (num_objs_for_inst > 0) {
            // Customizable object design
            var tier_1_radius_circle = 50
            var tier_1_radius_line_outer = 36
            var tier_1_radius_line_inner = 14
            var tier_2_radius_circle = 100
            var tier_2_radius_line_outer = 86
            var tier_2_radius_line_inner = 14
            // Draw center object
            this.drawCircleForObject(150, 150, 10, 0, 2 * Math.PI);

            // Draw other objects dynamically based on the amount given
            for (var i = 0; i < num_objs_for_inst; i++) {
                if (i < tier_1_obj_limit) {
                    // Draw tier 1 objects that are connected to the main
                    // object that was selected

                    // Modify x and y based on degrees_between_objects and the
                    // current object being created
                    // X := originX + cos(angle) * radius
                    // Y := originY + sin(angle) * radius
                    var radians = tier_1_degrees_between_objs * Math.PI / 180;
                    x = 150 + Math.cos(radians * (i + 1)) * tier_1_radius_circle;
                    y = 150 + Math.sin(radians * (i + 1)) * tier_1_radius_circle;
                    this.drawCircleForObject(x, y, 10, 0, 2 * Math.PI);
                    
                    // Draw relations between objects
                    x1 = 150 + Math.cos(radians * (i + 1)) 
                        * tier_1_radius_line_outer;
                    y1 = 150 + Math.sin(radians * (i + 1)) 
                        * tier_1_radius_line_outer;
                    x2 = 150 + Math.cos(radians * (i + 1)) 
                        * tier_1_radius_line_inner;
                    y2 = 150 + Math.sin(radians * (i + 1)) 
                        * tier_1_radius_line_inner;
                    this.drawRelationLineBetweenObjects(x1, y1, x2, y2);
                } else {
                    // Draw tier 2 objects that are connected to the main
                    // object that was selected
                    var radian_offset = 18 * Math.PI / 180;  // FIX: Only works on 15 objects
                    var radians = tier_2_degrees_between_objs * Math.PI / 180;
                    x = 150 + Math.cos(radians * (i + 1) + radian_offset) * tier_2_radius_circle;
                    y = 150 + Math.sin(radians * (i + 1) + radian_offset) * tier_2_radius_circle;
                    this.drawCircleForObject(x, y, 10, 0, 2 * Math.PI);
                    
                    // Draw relations between objects
                    x1 = 150 + Math.cos(radians * (i + 1) + radian_offset) 
                        * tier_2_radius_line_outer;
                    y1 = 150 + Math.sin(radians * (i + 1) + radian_offset) 
                        * tier_2_radius_line_outer;
                    x2 = 150 + Math.cos(radians * (i + 1) + radian_offset) 
                        * tier_2_radius_line_inner;
                    y2 = 150 + Math.sin(radians * (i + 1) + radian_offset) 
                        * tier_2_radius_line_inner;
                    this.drawRelationLineBetweenObjects(x1, y1, x2, y2);
                }
            }

            // TODO: Create handles for object information in instance viewer
            // such as object name, and relations between other objects

        } else {
            // Center object
            this.drawCircleForObject(150, 150, 10, 0, 2 * Math.PI);
            // TODO: Create handles for object information in instance viewer
            // NOTE: Would only need object name and similar info for this sec
        }
    }

    // ######################## //
    // Canvas drawing functions //
    // ######################## //

    this.drawCircleForObject = function (x, y, radius, startAngle, endAngle) {
        this.canvas_ctx.beginPath();
        // arc(x, y, radius, startAngle, endAngle)
        this.canvas_ctx.arc(x, y, radius, startAngle, endAngle);
        this.canvas_ctx.stroke();
        console.log(x + " " + y);  // REMOVE log

        return [x, y];
    }

    this.drawRelationLineBetweenObjects = function (x1, y1, x2, y2) {
        // 

        // Draw relation line
        this.canvas_ctx.beginPath();
        this.canvas_ctx.moveTo(x1, y1);
        this.canvas_ctx.lineTo(x2, y2);
        this.canvas_ctx.stroke();
    }
};

var test_i = 0;

function testInstanceLoop (amount_objects) {
    var cObj = new Canvas_Object();
    setTimeout(function () {
        cObj.createInstanceViewer(test_i);
        test_i++;
        if (test_i <= amount_objects) {
            testInstanceLoop(amount_objects);
       }
    }, 1000)
 }

$(document).ready(function() {
    var cObj = new Canvas_Object();
    //cObj.createInstanceViewer(15);
    testInstanceLoop(15);
});