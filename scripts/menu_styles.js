// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// menu for the MAKB web page.

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

// Handle sub-tabs
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

$(document).ready(function() {
	pageLoad();
});