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
	} else {
		showNotification("Error", "Notification was not of type 'Error', 'Other', 'Success' or warning'.");
	}
}

var loop_times = 10;  // time in seconds between each loop
var i = 1;
function loopNotificationQueue() {
	// A function that continuously checks, every 10 seconds, the notification
	// queue so it knows when to show notifications or not.
	setTimeout(function() {
		if (notification_queue.length > 0) {
			i++;
			notif_type = notification_queue[0][0];
			notif_content = notification_queue[0][1];
			showNotification(notif_type, notif_content);
			notification_queue.shift();  // Pop first element
			if (i < 999) {
				loopNotificationQueue();
			}
		} else {
			i++;
			loopNotificationQueue();
		}
	}, loop_times * 1000);
}

function modifyNotification(typeOfMessage, messageContent){        
	// Variables
	animation_time = 100;

	// A function that allows 4 different types of messages to be displayed.
	// Error, Other, Success, Warning
	if (typeOfMessage == "Error") {
		if (messageContent == null || messageContent == "") {
			messageContent = "There was an error but not message content was specified.";
		}
		$(".notification-bar").html(messageContent);
		$(".notification-bar").prepend("<h3 class=\"notification-bar-title\">Error</h3>")
		$(".notification-bar").css({"background-color":"#ff1a1a", "background-image":"linear-gradient(0deg, #cc0000 -40%, #ff6666 140%)",
									"box-shadow":"0 4px 8px 0 #800000, 0 6px 20px 0 #800000", "color":"#ffffff"});
	} else if (typeOfMessage == "Other") {
		if (messageContent == null || messageContent == "") {
			messageContent = "No message content specified.";
		}
		$(".notification-bar").html(messageContent);
		$(".notification-bar").prepend("<h3 class=\"notification-bar-title\">Other</h3>")
		$(".notification-bar").css({"background-color":"#ff1a1a", "background-image":"linear-gradient(0deg, #cc0000 -40%, #ff6666 140%)",
									"box-shadow":"0 4px 8px 0 #800000, 0 6px 20px 0 #800000", "color":"#ffffff"});
	} else if (typeOfMessage == "Success") {
		if (messageContent == null || messageContent == "") {
			messageContent = "It was successful but no message content was specified.";
		}
		$(".notification-bar").html(messageContent);
		$(".notification-bar").prepend("<h3 class=\"notification-bar-title\">Success</h3>")
		$(".notification-bar").css({"background-color":"#78c200", "background-image":"linear-gradient(0deg, #3f6600 -40%, #a7ff1a 140%)",
									"box-shadow":"0 4px 8px 0 #2f4d00, 0 6px 20px 0 #2f4d00", "color":"#ffffff"});
	} else if (typeOfMessage == "Warning") {
		if (messageContent == null || messageContent == "") {
			messageContent = "There may be issues but no message content was specified.";
		}
		$(".notification-bar").html(messageContent);
		$(".notification-bar").prepend("<h3 class=\"notification-bar-title\">Warning</h3>")
		$(".notification-bar").css({"background-color":"#ff9933", "background-image":"linear-gradient(0deg, #e67300 -40%, #ffbf80 140%)", 
									"box-shadow":"0 4px 8px 0 #994d00, 0 6px 20px 0 #994d00", "color":"#000000"});
	}
}

function toggleNotification(type, content) {
	if (notification_toggle == false) {
		showNotification(type, content);
	} else {
		hideNotification();
	}
}

function showNotification(type, content) {
	notification_toggle = true;
	$(".notification-bar").css("display", "block");
	modifyNotification(type, content);
	console.log("Showing notification '" + type + "' with content of '" + content + "'.");

	// Slide bar into view after displaying it
	$(".notification-bar").animate({bottom: "0%"}, notification_speed);
	timerNotification(5);
}

function hideNotification() {
	notification_toggle = false;
	// Slide away bar after removing it
	$(".notification-bar").animate({bottom: "-30%"}, notification_speed);
	setTimeout(function () {
		$(".notification-bar").css("display", "none");
	}, notification_speed);
}

function timerNotification(timeSeconds) {
	// Starts timer and counts down. Once completed, notification disappears.
	setTimeout(function() {
		hideNotification();
	}, timeSeconds * 1000);
}

$(document).ready(function() {
	loopNotificationQueue();
	showNotification('Warning', 'This is only a test.');
});