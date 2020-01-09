// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for notification functions and stylization.

// ########################### //
// ### Notification System ### //
// ########################### //
'use strict';
class ManagerNotification {
	constructor() {
		this.loop_time = 2;  // time in hours how long the loop should continue
		this.loop_notification_index = 1;
		this.notification_queue = [];
		this.notification_speed = 400;
		this.notification_toggle = false; // False = turned off
	}

	addToNotificationQueue(type, content) {
		// A function that takes in the notification type and the content message
		// of the notification and then adds the given content to a list of
		// notifications waiting to be displayed.
	
		if (type == "Error" || type == "Other" ||type == "Success" || type == "Warning") {
			this.notification_queue.push([type, content]);
			// Add to 'In Queue' dropdown item in the notifications tab
			$("#notification-in-queue").html("In Queue (" + this.notification_queue.length + ")");
		} else {
			this.showNotification("Error", "Notification '" + type + "' was not of type 'Error', 'Other', 'Success' or 'Warning'.");
		}
	}

	loopNotificationQueue() {
		// A function that continuously checks, every 10 seconds, the notification
		// queue so it knows when to show notifications or not.
	
		var that = this;
		setTimeout(function() {
			if (that.notification_queue.length > 0 && that.notification_toggle == false) {
				that.loop_notification_index++;
				var notif_type = that.notification_queue[0][0];
				var notif_content = that.notification_queue[0][1];
				that.showNotification(notif_type, notif_content);
				if (that.loop_notification_index < (that.loop_time * 3600)) {
					that.loopNotificationQueue();
				}
			} else {
				that.loop_notification_index++;
				that.loopNotificationQueue();
			}
		}, 2000);
		console.log("Notification queue time: (" + this.loop_notification_index + "/" + this.loop_time * 3600 + ")");
	}
	
	modifyNotification(typeOfMessage, messageContent){        
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
		$(".notification-bar").prepend("<a class=\"notification-bar-exit\" onclick=\"notification_manager.hideNotification()\">X</a>");
	}
	
	// ############################# //
	// ### Notification Movement ### //
	// ############################# //

	showNotification(type, content) {
		// A function that displays and animates a given notification
	
		$(".notification-bar").css("display", "block");
		this.modifyNotification(type, content);
		if (type == "Error") {
			console.error("[Notification]: " + type + " - " + content + ".");
		} else if (type == "Other") {
			console.info("[Notification]: " + type + " - " + content + ".");
		} else if (type == "Success") {
			console.info("[Notification]: " + type + " - " + content + ".");
		} else if (type == "Warning") {
			console.warn("[Notification]: " + type + " - " + content + ".");
		}
	
		// Slide bar into view after displaying it
		$(".notification-bar").animate({bottom: "0%"}, this.notification_speed);
		this.notification_toggle = true;

		// TODO: Log notificationto logs.txts
		var data = {
			notif_type: "test type",
			notif_content: "test content"
		};

		// TODO: Set up java servlet for apache tomcat first
		// $.ajax({
		// 	type: "POST",
		// 	url: "/test_servlet/MyServlet",
		// 	data: JSON.stringify(data), 
		// 	dataType: "json",
		// 	success: function(){console.log("Notification logged to node server.");},
		// 	contentType: "application/json"
		// });
	}
	
	hideNotification() {
		// A function, when called, hides a displayed notification.
	
		// Slide away bar after removing it
		$(".notification-bar").animate({bottom: "-30%"}, this.notification_speed);
		setTimeout(function() {
			$(".notification-bar").css("display", "none");
		}, this.notification_speed);
	
		// Make sure the queue doesn't try and show another notification while one
		// is still being hidden
		var that = this;
		setTimeout(function() {
			that.notification_toggle = false;
		}, this.notification_speed);
	
		// Remove notification after hidden
		this.notification_queue.shift();  // Pop first element
	
		// Update 'In-Queue' dropdown item in notification tab
		$("#notification-in-queue").html("In Queue (" + this.notification_queue.length + ")");
	}
}

var notification_manager = new ManagerNotification();

$(document).ready(function() {
	notification_manager.loopNotificationQueue();
	//showNotification('Warning', 'This is only a test.');
});