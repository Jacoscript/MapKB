function pageLoad(jQuery) {
	// Hover sub tabs for Add Marker
	// Syntax: .mouseenter(eventdata, function);
	$("#add-marker").mouseenter("add-marker", showSubTabs);
	$("#add-marker").mouseleave("add-marker", hideSubTabs);
	$("#sub-add-marker").mouseenter("add-marker", showSubTabs);
	$("#sub-add-marker").mouseleave("add-marker", hideSubTabs);
	
	// Hover sub tabs for Del Marker
	// Syntax: .mouseenter(eventdata, function);
	$("#del-marker").mouseenter("del-marker", showSubTabs);
	$("#del-marker").mouseleave("del-marker", hideSubTabs);
	$("#sub-del-marker").mouseenter("del-marker", showSubTabs);
	$("#sub-del-marker").mouseleave("del-marker", hideSubTabs);
};

// Show subtabs
function showSubTabs(specificTab) {
	$("#sub-" + specificTab.data).css("display", "block");
};
function hideSubTabs(specificTab) {
	$("#sub-" + specificTab.data).css("display", "none");
};

$(document).ready(function() {
	pageLoad();
});