// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for notification functions and stylization.

// Global variables
var notification_queue = [];
var notification_toggle = false; // False = turned off

// ########################### //
// ### Notification System ### //
// ########################### //

function notificationBar(typeOfMessage, secondsAlive, messageContent){
    // TODO: Check notification against queue and add it if not in
        // TODO: If notification not in queue and another notification is already, then make sure
        // latest notification gets played after current notification

        
	// Variables
	animation_time = 100;

	// A function that allows 4 different types of messages to be displayed.
	// Error, Other, Success, Warning
	if (notification_toggle == false && typeOfMessage != "Remove"){
		notification_toggle = true;
		$(".notification-bar").css("display", "block");
		$(".notification-bar-title").css("display", "block");
		$(".notification-bar").animate({"bottom": "5%"}, animation_time);
		$(".notification-bar-title").animate({"bottom": "5%"}, animation_time);
		setTimeout(function() {
			// Calculate title location depending on content amount since there can be multiline info
			$(".notification-bar-title").css("top", $(".notification-bar").position().top);
		}, animation_time);
	} else {
		// Check whether another notification with more or less content popped up while another was
		// still live. Adjust title location based on top of content bar.
		setTimeout(function() {
			// Calculate title location depending on content amount since there can be multiline info
			$(".notification-bar-title").css("top", $(".notification-bar").position().top);
		}, animation_time);
	}

	// Types of messages
	if (typeOfMessage == "Error") {
		$(".notification-bar-title").css("color", "#ffffff");
		$(".notification-bar-title").html("Error!");
		$(".notification-bar").css({"background-color":"#ff1a1a", "background-image":"linear-gradient(0deg, #cc0000 -40%, #ff6666 140%)",
									"box-shadow":"0 4px 8px 0 #800000, 0 6px 20px 0 #800000", "color":"#ffffff"});
		if (messageContent == null) {
			$(".notification-bar").html("There was an error but not message content was specified.");	
		} else {
			$(".notification-bar").html(messageContent);
		}
	} else if (typeOfMessage == "Other") {
		$(".notification-bar-title").css("color", "#ffffff");
		$(".notification-bar-title").html("Other");
		$(".notification-bar").css({"background-color":"#808080", "background-image":"linear-gradient(0deg, #595959 -40%, #a6a6a6 140%)",
									"box-shadow":"0 4px 8px 0 #262626, 0 6px 20px 0 #262626", "color":"#ffffff"});
		if (messageContent == null) {
			$(".notification-bar").html("No message content specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
	} else if (typeOfMessage == "Success") {
		$(".notification-bar-title").css("color", "#ffffff");
		$(".notification-bar-title").html("Success!");
		$(".notification-bar").css({"background-color":"#78c200", "background-image":"linear-gradient(0deg, #3f6600 -40%, #a7ff1a 140%)",
									"box-shadow":"0 4px 8px 0 #2f4d00, 0 6px 20px 0 #2f4d00", "color":"#ffffff"});
		if (messageContent == null) {
			$(".notification-bar").html("It was successful but no message content was specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
	} else if (typeOfMessage == "Warning") {
		$(".notification-bar-title").css("color", "#000000");
		$(".notification-bar-title").html("Warning!");
		$(".notification-bar").css({"background-color":"#ff9933", "background-image":"linear-gradient(0deg, #e67300 -40%, #ffbf80 140%)", 
									"box-shadow":"0 4px 8px 0 #994d00, 0 6px 20px 0 #994d00", "color":"#000000"});
		if (messageContent == null) {
			$(".notification-bar").html("There may be issues but no message content was specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
	} else if (typeOfMessage == "Remove") {
		if (notification_toggle != false) {
			$(".notification-bar").animate({"bottom": "-100px"}, animation_time);
			$(".notification-bar-title").animate({"bottom": "-100px"}, animation_time);
			setTimeout(function(){
				$(".notification-bar").css("display", "none");
				$(".notification-bar-title").css("display", "none");
			}, animation_time);
			notification_toggle = false;
		}
	}

    // Make notification disappear after X seconds
	if (typeOfMessage != "Remove") {
		if (secondsAlive == null) {
			secondsAlive = 5;  // default value if none given
		}
		setTimeout(function() {
			// Remove old unused css, note: it has an effect on position/animation
			$(".notification-bar-title").css("top", "")
			$(".notification-bar").animate({"bottom": "-100px"}, animation_time);
			$(".notification-bar-title").animate({"bottom": "-100px"}, animation_time);
			setTimeout(function() {
				$(".notification-bar").css("display", "none");
				$(".notification-bar-title").css("display", "none");
			}, animation_time);
			notification_toggle = false;
		}, secondsAlive * 1000);
	}
}