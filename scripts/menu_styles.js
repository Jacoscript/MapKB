// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// menu for the MAKB web page.

// Global variables
var toggle_notification = false; // False = turned off

function pageLoad(jQuery) {
	handleDropDowns();
	handleSubTabs();
};

// ########################################## //
// ### Dropdown and dropdown content code ### //
// ########################################## //

function handleDropDowns(){
	// A function to stylize dropdown-content moving towards menu bar.
	$(".drop-btn").mouseenter(moveContentUp)
}
function moveContentUp(){
	$(".dropdown-content").css("top", "75px");
	$(".dropdown-content").animate({"top": "58px"}, 200);
}

// #################### //
// ### Sub-tab code ### //
// #################### //

function handleSubTabs(){
	// A function that makes sure that sub-tabs are open only when they are
	// interacted by their parent tab.
	
	// NOTE: Make sure any new sub-tabs are added below
	
	// Hover sub-tabs for Add Marker
	// Syntax: .mouseenter(eventData, function);
	$("#add-marker").mouseenter("add-marker", showSubTabs);
	$("#add-marker").mouseleave("add-marker", hideSubTabs);
	$("#sub-add-marker").mouseenter("add-marker", showSubTabs);
	$("#sub-add-marker").mouseleave("add-marker", hideSubTabs);
	
	// Hover sub-tabs for Del Marker
	// Syntax: .mouseenter(eventData, function);
	$("#del-marker").mouseenter("del-marker", showSubTabs);
	$("#del-marker").mouseleave("del-marker", hideSubTabs);
	$("#sub-del-marker").mouseenter("del-marker", showSubTabs);
	$("#sub-del-marker").mouseleave("del-marker", hideSubTabs);
};

function showSubTabs(eventData) {
	$("#sub-" + eventData.data).css("display", "block");
};
function hideSubTabs(eventData) {
	$("#sub-" + eventData.data).css("display", "none");
};

// ########################### //
// ### Notification System ### //
// ########################### //

function notificationBar(typeOfMessage, secondsAlive, messageContent){
	// Variables
	animation_time = 100;

	// A function that allows 4 different types of messages to be displayed.
	// Error, Other, Success, Warning
	if (toggle_notification == false){
		toggle_notification = true;
		$(".notification-bar").css("display", "block");
		$(".notification-bar-title").css("display", "block");
		$(".notification-bar").animate({"bottom": "5%"}, animation_time);
		$(".notification-bar-title").animate({"bottom": "5%"}, animation_time);
		setTimeout(function() {
			// Calculate title location depending on content amount since there can be multiline info
			$(".notification-bar-title").css("top", $(".notification-bar").position().top);
		}, animation_time);
	} else {
		// Check wheter another notification with more or less content popped up while another was
		// still live. Adjust title location based on top of content bar.
		setTimeout(function() {
			// Calculate title location depending on content amount since there can be multiline info
			$(".notification-bar-title").css("top", $(".notification-bar").position().top);
		}, animation_time);
	}

	// Types of messages
	if (typeOfMessage == "Error") {
		$(".notification-bar-title").html("Error!");
		$(".notification-bar-title").css("color", "#ffffff");
		if (messageContent == null) {
			$(".notification-bar").html("There was an error but not message content was specified.");	
		} else {
			$(".notification-bar").html(messageContent);
		}
		$(".notification-bar").css("background-color", "#ff1a1a");
		$(".notification-bar").css("background-image", "linear-gradient(0deg, #cc0000 -40%, #ff6666 140%)");
		$(".notification-bar").css("box-shadow", "0 4px 8px 0 #800000, 0 6px 20px 0 #800000");
		$(".notification-bar").css("color", "#ffffff");
	} else if (typeOfMessage == "Other") {
		$(".notification-bar-title").html("Other");
		$(".notification-bar-title").css("color", "#ffffff");
		if (messageContent == null) {
			$(".notification-bar").html("No message content specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
		$(".notification-bar").css("background-color", "#808080");
		$(".notification-bar").css("background-image", "linear-gradient(0deg, #595959 -40%, #a6a6a6 140%)");
		$(".notification-bar").css("box-shadow", "0 4px 8px 0 #262626, 0 6px 20px 0 #262626");
		$(".notification-bar").css("color", "#ffffff");
	} else if (typeOfMessage == "Success") {
		$(".notification-bar-title").html("Success!");
		$(".notification-bar-title").css("color", "#ffffff");
		if (messageContent == null) {
			$(".notification-bar").html("It was successful but no message content was specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
		$(".notification-bar").css("background-color", "#78c200");
		$(".notification-bar").css("background-image", "linear-gradient(0deg, #3f6600 -40%, #a7ff1a 140%)");
		$(".notification-bar").css("box-shadow", "0 4px 8px 0 #2f4d00, 0 6px 20px 0 #2f4d00");
		$(".notification-bar").css("color", "#ffffff");
	} else if (typeOfMessage == "Warning") {
		$(".notification-bar-title").html("Warning!");
		$(".notification-bar-title").css("color", "#000000");
		if (messageContent == null) {
			$(".notification-bar").html("There may be issues but no message content was specified.");
		} else {
			$(".notification-bar").html(messageContent);
		}
		$(".notification-bar").css("background-color", "#ff9933");
		$(".notification-bar").css("background-image", "linear-gradient(0deg, #e67300 -40%, #ffbf80 140%)");
		$(".notification-bar").css("box-shadow", "0 4px 8px 0 #994d00, 0 6px 20px 0 #994d00");
		$(".notification-bar").css("color", "#000000");
	} else if (typeOfMessage == "Remove") {
		$(".notification-bar").animate({"bottom": "-100px"}, animation_time);
		$(".notification-bar-title").animate({"bottom": "-100px"}, animation_time);
		setTimeout(function(){
			$(".notification-bar").css("display", "none");
			$(".notification-bar-title").css("display", "none");
		}, animation_time);
		toggle_notification = false;
	}

	// Make notification disappear after X seconds
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
		toggle_notification = false;
	}, secondsAlive * 1000);
}

$(document).ready(function() {
	pageLoad();
});