// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// menu for the MAKB web page.

function pageLoad(jQuery) {
	handleSubTabs();
};

// #################### //
// ### Sub-tab code ### //
// #################### //

// Handle sub-tabs
// A function that makes sure that sub-tabs are open only when they are
// interacted by their parent tab.
function handleSubTabs(){
	// TODO: Grab position of parent tab and set margin based off of parent tab
	
	// Below doesn't work
	// $("#add-marker").html("Add Marker " + $(".dropbtn").offset().top);
	
	
	// Hover sub-tabs for Add Marker
	// Syntax: .mouseenter(eventdata, function);
	$("#add-marker").mouseenter("add-marker", showSubTabs);
	$("#add-marker").mouseleave("add-marker", hideSubTabs);
	$("#sub-add-marker").mouseenter("add-marker", showSubTabs);
	$("#sub-add-marker").mouseleave("add-marker", hideSubTabs);
	
	// Hover sub-tabs for Del Marker
	// Syntax: .mouseenter(eventdata, function);
	$("#del-marker").mouseenter("del-marker", showSubTabs);
	$("#del-marker").mouseleave("del-marker", hideSubTabs);
	$("#sub-del-marker").mouseenter("del-marker", showSubTabs);
	$("#sub-del-marker").mouseleave("del-marker", hideSubTabs);
};

function showSubTabs(specificTab) {
	$("#sub-" + specificTab.data).css("display", "block");
};
function hideSubTabs(specificTab) {
	$("#sub-" + specificTab.data).css("display", "none");
};

$(document).ready(function() {
	pageLoad();
});