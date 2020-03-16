// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// menu for the MAKB web page.

function pageLoad() {
	// A function to run once the web page loads.
	
	$(function() {
		// ------------------------------------------------------- //
		// Multi Level dropdowns
		// ------------------------------------------------------ //
		$("ul.dropdown-menu [data-toggle='dropdown']").on("click", function(event) {
			event.preventDefault();
			event.stopPropagation();
	
			$(this).siblings().toggleClass("show");
	
	
			if (!$(this).next().hasClass('show')) {
				$(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
				}
				$(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function(e) {
				$('.dropdown-submenu .show').removeClass("show");
			});
	
		});
	});

	// NOTE: Make sure any new sub-tabs are added below
	var sub_tab_list = ["markers", "del-marker"];
	sub_tab_list.forEach(handleSubTabs);
	handleDropDowns();
}

// ########################################## //
// ### Dropdown and dropdown content code ### //
// ########################################## //

function handleDropDowns(){
	// A function to stylize dropdown-content moving towards menu bar.

	$(".drop-btn").mouseenter(moveContentUp);
}
function moveContentUp(){
	// A function to give animation to the dropdowns by moving them upwards
	// towards the menu.

	$(".dropdown-content").css("top", "75px");
	$(".dropdown-content").animate({"top": $(".css-menu").height()}, 200);
}

// #################### //
// ### Sub-tab code ### //
// #################### //

function handleSubTabs(sub_tab_name, index){
	// A function that makes sure that sub-tabs are open only when they are
	// interacted by their parent tab.

	// Syntax: .mouseenter(eventData, function);
	$("#" + sub_tab_name).mouseenter(sub_tab_name, showSubTabs);
	$("#" + sub_tab_name).mouseleave(sub_tab_name, hideSubTabs);
	$("#sub-" + sub_tab_name).mouseenter(sub_tab_name, showSubTabs);
	$("#sub-" + sub_tab_name).mouseleave(sub_tab_name, hideSubTabs);
}

function showSubTabs(eventData) {
	// A function to change css to show desired sub tabs.

	$("#sub-" + eventData.data).css("display", "block");
}
function hideSubTabs(eventData) {
	// A function to change css to hide desired sub tabs.

	$("#sub-" + eventData.data).css("display", "none");
}

$(document).ready(function() {
	pageLoad();
});