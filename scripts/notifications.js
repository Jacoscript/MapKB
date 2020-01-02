// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for notification functions and stylization.

// Global variables
var notification_queue = [];
var notification_speed = 400;
var notification_toggle = false; // False = turned off

// ########################### //
// ### Notification System ### //
// ########################### //

function addToNotificationQueue(type, content) {
	if (type == "Error" || type == "Other" ||type == "Success" || type == "Warning") {
		notification_queue.push([type, content]);
		// Add to 'In Queue' dropdown item in the notifications tab
		$("#notification-in-queue").html("In Queue (" + notification_queue.length + ")");
	} else {
		showNotification("Error", "Notification '" + type + "' was not of type 'Error', 'Other', 'Success' or 'Warning'.");
	}
}

var loop_time = 2;  // time in hours how long the loop should continue
var loop_notification_index = 1;
function loopNotificationQueue() {
	// A function that continuously checks, every 10 seconds, the notification
	// queue so it knows when to show notifications or not.

	setTimeout(function() {
		if (notification_queue.length > 0 && notification_toggle == false) {
			loop_notification_index++;
			notif_type = notification_queue[0][0];
			notif_content = notification_queue[0][1];
			showNotification(notif_type, notif_content);
			if (loop_notification_index < (loop_time * 3600)) {
				loopNotificationQueue();
			}
		} else {
			loop_notification_index++;
			loopNotificationQueue();
		}
	}, 2000);
	console.log("Notification queue time: (" + loop_notification_index + "/" + loop_time * 3600 + ")");
}

function modifyNotification(typeOfMessage, messageContent){        
	// A function that allows 4 different types of messages to be displayed.
	// Error, Other, Success, Warning

	// Perform checks on message content and change css for the given type of notification
	if (typeOfMessage == "Error") {
		if (messageContent == null || messageContent == "") {
			messageContent = "There was an error but not message content was specified.";
		}
		$(".notification-bar").css({"background-color":"#ff1a1a", "background-image":"linear-gradient(0deg, #660000 -40%, #ff0000 140%)",
									"box-shadow":"0 4px 8px 0 #1a0000, 0 6px 20px 0 #1a0000", "color":"#ffffff"});
	} else if (typeOfMessage == "Other") {
		if (messageContent == null || messageContent == "") {
			messageContent = "No message content specified.";
		}
		$(".notification-bar").css({"background-color":"#ff1a1a", "background-image":"linear-gradient(0deg, #333333 -40%, #808080 140%)",
									"box-shadow":"0 4px 8px 0 #0d0d0d, 0 6px 20px 0 #0d0d0d", "color":"#ffffff"});
	} else if (typeOfMessage == "Success") {
		if (messageContent == null || messageContent == "") {
			messageContent = "It was successful but no message content was specified.";
		}
		$(".notification-bar").css({"background-color":"#78c200", "background-image":"linear-gradient(0deg, #3f6600 -40%, #9dff00 140%)",
									"box-shadow":"0 4px 8px 0 #101a00, 0 6px 20px 0 #101a00", "color":"#ffffff"});
	} else if (typeOfMessage == "Warning") {
		if (messageContent == null || messageContent == "") {
			messageContent = "There may be issues but no message content was specified.";
		}
		$(".notification-bar").css({"background-color":"#ff9933", "background-image":"linear-gradient(0deg, #e67300 -40%, #ffbf80 140%)", 
									"box-shadow":"0 4px 8px 0 #994d00, 0 6px 20px 0 #994d00", "color":"#000000"});
	}

	// Reset notification content to the given content and prepend a title
	if (typeOfMessage == "Error" || typeOfMessage == "Other" || typeOfMessage == "Success" || typeOfMessage == "Warning") {
		$(".notification-bar").html("<h3 class=\"notification-bar-title\">" + typeOfMessage + "</h3>");
	}
	$(".notification-bar").append(messageContent);

	// Add notification exit button (or link with 'x' char?)
	$(".notification-bar").prepend("<a class=\"notification-bar-exit\" onclick=\"hideNotification()\">X</a>");
}

function showNotification(type, content) {
	// A function that displays and animates a given notification

	$(".notification-bar").css("display", "block");
	modifyNotification(type, content);
	console.log("Showing notification '" + type + "' with content of '" + content + "'.");

	// Slide bar into view after displaying it
	$(".notification-bar").animate({bottom: "0%"}, notification_speed);
	notification_toggle = true;
}

function hideNotification() {
	// Slide away bar after removing it
	$(".notification-bar").animate({bottom: "-30%"}, notification_speed);
	setTimeout(function() {
		$(".notification-bar").css("display", "none");
	}, notification_speed);

	// Make sure the queue doesn't try and show another notification while one
	// is still being hidden
	setTimeout(function() {
		notification_toggle = false;
	}, notification_speed);

	// Remove notification after hidden
	notification_queue.shift();  // Pop first element

	// Update 'In-Queue' dropdown item in notification tab
	$("#notification-in-queue").html("In Queue (" + notification_queue.length + ")");
}

$(document).ready(function() {
	loopNotificationQueue();
	//showNotification('Warning', 'This is only a test.');
});