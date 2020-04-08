// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for the general stylizing and user interaction with the
// menu for the MAKB web page.

function pageLoad() {
	// A function to run once the web page loads.
	$(function() {
		// --------------------- //
		// Multi Level dropdowns
		// --------------------- //
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
}

$(document).ready(function() {
	pageLoad();
});