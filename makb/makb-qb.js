// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for custom query builder operations.

const MAX_CUSTOM_QUERIES = 6;
const MAX_CUSTOM_GRAPHS = 15;

var current_custom_queries = 0;
var pending_predicates = false;
var query_tab_id;
var query_tab_list = [];
var selected_comparison = '';

class QueryTab {
	constructor(id) {
		this.tab_id = id;
		this.current_custom_graphs = 0;
		this.current_custom_predicates = 0;
		this.graph_context_values = [];  // Used to hold all graphs for each tab
		this.graph_predicate_values = [];  // Used to hold selected predicates for each tab
		this.old_graph_context_values = [];
		this.old_graph_predicate_values = [];
		this.show_common_predicates = false;  // When true, will allow the system to look for common predicates to display
		this.show_geosparql = false;
		this.geo_coordinates = [];
		this.geo_current_custom_graphs = 0;
		this.geo_graph_context_values = [];  // TODO: Apply like the sparql version too 
		this.geo_old_graph_context_values = [];  // TODO: Apply like the sparql version too 
	}

	recalculateGraphValues() {
		try {
			var id_sliced = query_tab_id.slice(5, 6) - 1;
			this.old_graph_context_values = this.graph_context_values;
			this.graph_context_values = [];

			for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
				query_tab_list[id_sliced].graph_context_values.push($('#' + query_tab_id + '-qb-context-selector-' + i).val());
			}
			if (this.current_custom_predicates != 0) {
				$('#' + query_tab_id + '-qb-btn-find-query-predicates').html('Update Predicates');
			}
		} catch (err) {
			notification_manager.addToNotificationQueue('Error', 'Recalculate graph values - ' + err)
		}
	}

	// A function to dynamically update the predicates for a query tab whenever the selection is changed.
	recalculatePredicateValues() {
		try {
			var id_sliced = query_tab_id.slice(5, 6) - 1;
			this.old_graph_predicate_values = this.graph_predicate_values;
			this.graph_predicate_values = [];
			
			for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
				query_tab_list[id_sliced].graph_predicate_values.push($('#' + query_tab_id + '-qb-predicate-selector-' + i).val());
			}
		} catch (err) {
			notification_manager.addToNotificationQueue('Error', 'Recalculate predicate values - ' + err)
		}
	}
}

//Function to display the query as a tab
function createQueryTab(){
	var HTML = '';

	// Check whether max queries are already open
	if (current_custom_queries == MAX_CUSTOM_QUERIES) {
		// Still need to display the qb widget
		displayUpdateQBWidget();
		return;
	} else {
		current_custom_queries += 1;
		query_tab_list.push(new QueryTab(current_custom_queries));
		query_tab_id = 'tabs-' + current_custom_queries;
		var id_sliced = query_tab_id.slice(5, 6) - 1;
		//createTab('Query Builder', HTML);
		createTab('Query Builder');

		// Ask whether user wants to use GeoSPARQL functions or regular SPARQL functions
		HTML += '<div class="" id="' + query_tab_id +'-section-intro"><span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-or-not">Would you like to use GeoSPARQL or SPARQL?</span><br/>';
		HTML += '<input id="' + query_tab_id + '-qb-radio-choose-sparql" name="sparql" type="radio" value="SPARQL"/> SPARQL <input id="' + query_tab_id + '-qb-radio-choose-geosparql" name="sparql" type="radio" value="GeoSPARQL"/> GeoSPARQL <br/>';
		HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-sparql-option" type="button" onclick="determineSPARQLFunction();">Submit</button><hr/>';
		
		// Setup radio button functionality
		$('#' + query_tab_id + '-qb-radio-choose-geosparql').click(function() {
			if($('#' + query_tab_id + '-qb-radio-choose-geosparql').is(':checked')) {
				query_tab_list[id_sliced].show_geosparql = true;
			}
		});
		$('#' + query_tab_id + '-qb-radio-choose-sparql').click(function() {
			if($('#' + query_tab_id + '-qb-radio-choose-sparql').is(':checked')) {
				query_tab_list[id_sliced].show_geosparql = false;
			}
		});

		$('#' + query_tab_id).append(HTML);
	}
	// Display/Update the afd tab section after everything is created
	displayUpdateQBWidget();
}

// Function to check whether the user wants to work with GeoSPARQL functions
// or regular SPARQL functions
function determineSPARQLFunction() {
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	if ($('#' + query_tab_id + '-qb-radio-choose-geosparql').is(':checked')) {
		query_tab_list[id_sliced].show_geosparql = true;
		getGeoBasicGeoSPARQLInfo();
	} else if($('#' + query_tab_id + '-qb-radio-choose-sparql').is(':checked')) {
		query_tab_list[id_sliced].show_geosparql = false;
		getBasicSPARQLInfo();
	}
}

// ####################### //
// ## GeoSPARQL Section ## //
// ####################### //

function getGeoBasicGeoSPARQLInfo() {
	var HTML = '';
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	// Remove all previous qb info since user may have wanted to change
	$('#' + query_tab_id).empty();

	// Add back the question for the user in case they want to change from geosparql to sparql
	HTML += '<div class="" id="' + query_tab_id +'-section-intro"><span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-or-not">Would you like to use GeoSPARQL or SPARQL?</span><br/>';
	HTML += '<input id="' + query_tab_id + '-qb-radio-choose-sparql" name="sparql" type="radio" value="SPARQL"/> SPARQL <input checked id="' + query_tab_id + '-qb-radio-choose-geosparql" name="sparql" type="radio" value="GeoSPARQL"/> GeoSPARQL <br/>';
	HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-sparql-option" type="button" onclick="determineSPARQLFunction();">Submit</button><hr/>';

	// Get the coordinates from user geom if it exist
	HTML += '<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-coords-title">Geometry Coordinates Used:</span><br/>';
	if (created_leaflet_objects.length >= 1) {
		for(var i = 0; i < created_leaflet_objects[0].latlng.length; i++) {
			// Add coordinates to display to user
			HTML += '<span class="qb-text" id="' + query_tab_id + '-qb-text-geo-coords-' + (i + 1) + '">' + created_leaflet_objects[0].latlng[i].lat + ' ' + created_leaflet_objects[0].latlng[i].lng + '</span><br/>';

			// // Store coordinates for later graph use
			var temp_coords = {
				lat: created_leaflet_objects[0].latlng[i].lat, 
				lng: created_leaflet_objects[0].latlng[i].lng};
			query_tab_list[id_sliced].geo_coordinates.push(temp_coords);
		}
		HTML += getGeoUserDesiredGeoSPARQLFunction();
	} else if (created_leaflet_objects.length < 1) {
		HTML += '<span class="qb-text" id="' + query_tab_id + '-qb-text-no-geo-created" style="color: red;">Sorry but you still need to create a geometry with the tools on the left side of the map. The polygon tool is the only one that works at the moment.</span>';
	}
	HTML += '</div>';
	$('#' + query_tab_id).append(HTML);
}

function getGeoUserDesiredGeoSPARQLFunction() {
	var geosparql_functions = ['ehContains', 'ehCoveredBy', 'ehCovers', 'ehDisjoint', 'ehEqual', 'ehInside', 'ehMeet', 'ehOverlap',
							   'rcc8Contains', 'rcc8CoveredBy', 'rcc8Covers', 'rcc8Disjoint', 'rcc8Equal', 'rcc8Inside', 'rcc8Meet', 'rcc8Overlap',
							   'sfContains', 'sfCoveredBy', 'sfCovers', 'sfDisjoint', 'sfEqual', 'sfInside', 'sfMeet', 'sfOverlap'];
	var HTML = '';
	var query_tab_id = 'tabs-' + current_custom_queries;

	// Show GeoSPARQL functions
	HTML += '<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-functions-info">Choose a GeoSPARQL Function</span><br/>';
	HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-geosparql-function-selector" title="GeoSPARQL Functions">';
	// Get Options
	for(var i = 0; i < geosparql_functions.length; i++) {
		var temp_string = '<option value="' + geosparql_functions[i] + '">' + geosparql_functions[i] + '</option>';
		HTML = HTML + temp_string;
	}
	HTML += '</select>';
	HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-desired-graph" type="button" onclick="getGeoUserDesiredGraphNumber();">Submit</button><hr/>';
	return HTML;
}

function getGeoUserDesiredGraphNumber() {
	var HTML = '';
	HTML += '<div class="" id="' + query_tab_id +'-section-graph-number"><span class="qb-text-title" id="' + query_tab_id + '-qb-text-graph-number">How many layers would you like:</span>'
			+ '<input class="qb-input-graph-number" id="' + query_tab_id + '-qb-input-graph-number" name="graph-number" title="Number between 1-' + MAX_CUSTOM_GRAPHS + '" type="text" value="Number here"/>'
			+ '<button class="qb-button" id="' + query_tab_id + '-qb-btn-graph-number-submit" type="button" onclick="checkUserQueryValidity(\'Geo Graph\');">Submit</button></div>'

	$('#' + query_tab_id).append(HTML);

	// Allow full value selection on click
	$('#' + query_tab_id + '-qb-input-graph-number').focus(function() {
		$(this).on("click.a keyup.a", function(e){      
			$(this).off("click.a keyup.a").select();
		});
	});
}

function getGeoUserDesiredGraph(number_of_graphs) {
	var HTML= '';
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	//Get the specified query
	var query = 'SELECT DISTINCT ?g '+
				'WHERE { ' +
				'GRAPH ?g { ?s ?p ?o } ' +
				'}' ; 
	
	//HTTP encode the query
	query = encodeURIComponent(query);
	//Create the URL for the HTTP request
	var http_get = MARMOTTA_SPARQL_URL + query;
	// execute sparql query in marmotta
	$.get({url: http_get, 
		success: function(result) {
			//If there are no results say so. Otherwise, visualize them.
			if(!result) {
				notification_manager.addToNotificationQueue('Warning', 'No results while finding graphs.');
			}
			else {
				bindings = result.results.bindings;
				// Check how many results there are. If 0 throw an error. Otherwise, visualize them.
				if(bindings.length > 0) {
					if(query_tab_list[id_sliced].current_custom_graphs == number_of_graphs) {
						// Reload if user hits submit again
						// Update new section if graph number was changed
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
							$('#' + query_tab_id + '-qb-context-selector-' + i).remove();
						}
						$('#' + query_tab_id + '-section-graph-selection').remove();
						$('#' + query_tab_id + '-section-predicate-selection').remove();
						$('#' + query_tab_id + '-section-filter-selection').remove();
						$('#' + query_tab_id + '-section-query-selection').remove();
				
						$('#' + query_tab_id).append('<div class="" id="' + query_tab_id + '-section-graph-selection"></div><div class="" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="" id="' + query_tab_id + '-section-filter-selection"></div><div class="" id="' + query_tab_id + '-section-query-selection"></div>')
						$('#' + query_tab_id + '-section-graph-selection').append('<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-graph-info">Choose a Graph to Apply Your Desired Function to</span><br/>');
						// Update class variables
						query_tab_list[id_sliced].geo_graph_context_values = [];
						query_tab_list[id_sliced].graph_predicate_values = [];
					} else if (query_tab_list[id_sliced].current_custom_graphs == 0) {
						// Create new section based
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						$('#' + query_tab_id + '-section-graph-selection').append('<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-graph-info">Choose a Graph to Apply Your Desired Function to</span><br/>');
					} else {
						// Update new section if graph number was changed
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
							$('#' + query_tab_id + '-qb-context-selector-' + i).remove();
						}
						$('#' + query_tab_id + '-section-graph-selection').remove();
						$('#' + query_tab_id + '-section-predicate-selection').remove();
						$('#' + query_tab_id + '-section-filter-selection').remove();
						$('#' + query_tab_id + '-section-query-selection').remove();
				
						$('#' + query_tab_id).append('<div class="" id="' + query_tab_id + '-section-graph-selection"></div><div class="" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="" id="' + query_tab_id + '-section-filter-selection"></div><div class="" id="' + query_tab_id + '-section-query-selection"></div>')
						$('#' + query_tab_id + '-section-graph-selection').append('<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-graph-info">Choose a Graph to Apply Your Desired Function to</span><br/>');
						// Update class variables
						query_tab_list[id_sliced].graph_context_values = [];
						query_tab_list[id_sliced].graph_predicate_values = [];
					}

					//go through all of the results.
					for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
						HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-context-selector-'+ i +'" title="Graph ' + i + '">';
						// Get Options
						for(var j = 0; j < bindings.length; j++) {
							//declare the variables given the results.
							context = bindings[j].g.value;
							//only include relevant contexts.
							if(context.includes("http://localhost:8080/marmotta/context/"))
							{
								var temp_string = '<option value="' + context + '">' + context + '</option>';
								HTML = HTML + temp_string;
							}
						}
						HTML += '</select>'
					}
					if(query_tab_list[id_sliced].current_custom_graphs > 1) {
						HTML += '<span class="qb-text" id="' + query_tab_id + '-qb-text-common-predicates">Would you like to show common predicates between the multiple graphs?</span>'
						HTML += '<input checked="true" id="' + query_tab_id + '-qb-radio-geo-predicates-yes" name="predicates" type="radio" value="Yes"/>Yes<input id="' + query_tab_id + '-qb-radio-geo-predicates-no" name="predicates" type="radio" value="No"/>No<br/>';
					}
					HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-geosparql-query" type="button" onclick="displayGeoSPARQLQuery();">Submit</button><hr/>';				
					
					// Append to specific section inside query tab
					$('#' + query_tab_id + '-section-graph-selection').append(HTML);
					$('#' + query_tab_id + '-section-graph-selection .qb-select-dropdown').change(function() {
						query_tab_list[id_sliced].recalculateGraphValues();
					});

					// Setup checks for radio buttons (radio btns for common predicates only show if there's more than 1 graph)
					$('#' + query_tab_id + '-qb-radio-geo-predicates-yes').click(function() {
						if($('#' + query_tab_id + '-qb-radio-geo-predicates-yes').is(':checked')) {
							query_tab_list[id_sliced].show_common_predicates = true;
						}
					});
					$('#' + query_tab_id + '-qb-radio-geo-predicates-no').click(function() {
						if($('#' + query_tab_id + '-qb-radio-geo-predicates-no').is(':checked')) {
							query_tab_list[id_sliced].show_common_predicates = false;
						}
					});
				}
				else { //There was no results so do nothing.
					notification_manager.addToNotificationQueue('Error', 'No results for bindings while modifying query tab.');
				}
			}
		}
	});

	$('#' + query_tab_id).append(HTML);
}

function displayGeoSPARQLQuery() {
	var HTML = '';
	HTML += '<span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-functions-info">GeoSPARQL Query</span><br/>';

	// TODO: Display query for user to copy/look/modify
	// Coords - query_tab_list[id_sliced].geo_coordinates[0].lat (or lng)
	var query = '';
	var query_intro = 'PREFIX geo: <http://www.opengis.net/ont/geosparql#>' + 
					  'PREFIX geof: <http://www.opengis.net/def/function/geosparql/> ' +
					  'PREFIX sf: <http://www.opengis.net/ont/sf#> ';
	var query_graph = '';
	var query_outro = '';

	// Generate the selected graphs
	var selected_graphs = '';	
	query_tab_list[id_sliced].geo_graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <' + item + '> ';
	});

	// Combine all parts of the query
	query = query_intro + query_graph + query_outro;
	
	// Build query area and show to user their generated query
	HTML += '<textarea class="qb-text-area" cols="50" rows="20" id="' + query_tab_id + '-qb-generated-query">' + query + '</textarea>'
			+ '<button class="qb-run-query qb-button" id="' + query_tab_id + '-qb-run-query" type="button" onclick="getQueryField()">Run Query</button>'
			+ '<button class="qb-clear-map qb-button" id="' + query_tab_id + '-qb-clear-map" type="button" onclick="clearMap()">Clear Map</button>';
	$('#' + query_tab_id).append(HTML);
}

// #################### //
// ## SPARQL Section ## //
// #################### //

// A function that retrieves the number of layers the user wants
function getBasicSPARQLInfo() {
	var HTML = '';

	// Add back the question for the user in case they want to change from geosparql to sparql
	HTML += '<div class="" id="' + query_tab_id +'-section-intro"><span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-or-not">Would you like to use GeoSPARQL or SPARQL?</span><br/>';
	HTML += '<input id="' + query_tab_id + '-qb-radio-choose-geosparql" name="sparql" type="radio" value="GeoSPARQL"/> GeoSPARQL <input checked id="' + query_tab_id + '-qb-radio-choose-sparql" name="sparql" type="radio" value="SPARQL"/> SPARQL <br/>';
	HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-sparql-option" type="button" onclick="determineSPARQLFunction();">Submit</button><hr/>';
	HTML += '<div class="" id="' + query_tab_id +'-section-intro"><span class="qb-text" id="' + query_tab_id + '-qb-text-graph-number">How many layers would you like:</span>'
			+ '<input class="qb-input-graph-number" id="' + query_tab_id + '-qb-input-graph-number" name="graph-number" title="Number between 1-' + MAX_CUSTOM_GRAPHS + '" type="text" value="Number here"/>'
			+ '<button class="qb-button" id="' + query_tab_id + '-qb-btn-graph-number-submit" type="button" onclick="checkUserQueryValidity(\'Graph Number\');">Submit</button></div>'
			+ '<div class="" id="' + query_tab_id + '-section-graph-selection"></div>'
			+ '<div class="" id="' + query_tab_id + '-section-predicate-selection"></div>'
			+ '<div class="" id="' + query_tab_id + '-section-filter-selection"></div>'
			+ '<div class="" id="' + query_tab_id + '-section-query-selection"></div>'
	
	// Remove all previous qb info since user may have wanted to change
	$('#' + query_tab_id + ' p').remove();
	$('#' + query_tab_id).empty();

	$('#' + query_tab_id).append(HTML);

	// Allow full value selection on click
	$('#' + query_tab_id + '-qb-input-graph-number').focus(function() {
		$(this).on("click.a keyup.a", function(e){      
			$(this).off("click.a keyup.a").select();
		});
	});
}

// A function that checks the validy of different inputs from the user for the
// number of graphs they'll be using.
function checkUserQueryValidity(type_of_input) {
	// Check whether user submits an integer and is less than max graphs
	if(type_of_input == 'Graph Number') {
		const pattern = new RegExp('^[0-9]{1,2}$');  // Accepts 1 or 2 numbers
		let arr;
		let input_field = $('#' + query_tab_id + '-qb-input-graph-number');
		let input_value = parseInt(input_field.val());  // Num of graphs

		if((arr = pattern.exec(input_value)) !== null) {
			if(arr[0] <= MAX_CUSTOM_GRAPHS && arr[0] > 0) {
				// If validy succeeds, change value of input box
				$('#' + query_tab_id + '-qb-input-graph-number').attr('value', arr[0]);
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '');
				chooseQueryGraphs(arr[0]);  // Tell function to make x amt of graphs
			} else if(arr[0] > MAX_CUSTOM_GRAPHS) {
				alert(`Input is more than max graphs: ${arr[0]}/${MAX_CUSTOM_GRAPHS}.`);
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
				return;
			} else if(arr[0] <= 0) {
				alert('You need at least one graph in order to build a query.')
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
				return;
			}
		} else {
			alert(`Regex denied submission. Submit a number between 1 and ${MAX_CUSTOM_GRAPHS}.`);
			$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
			return;
		}
	} else if (type_of_input == 'Graph Filter') {
		// TODO: Check whether user submits specific filter type based on the filter dropdown selection
		generateQuery();
	} else if (type_of_input == 'Geo Graph') {
		const pattern = new RegExp('^[0-9]{1,2}$');  // Accepts 1 or 2 numbers
		let arr;
		let input_field = $('#' + query_tab_id + '-qb-input-graph-number');
		let input_value = parseInt(input_field.val());  // Num of graphs

		if((arr = pattern.exec(input_value)) !== null) {
			if(arr[0] <= MAX_CUSTOM_GRAPHS && arr[0] > 0) {
				// If validy succeeds, change value of input box
				$('#' + query_tab_id + '-qb-input-graph-number').attr('value', arr[0]);
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '');
				getGeoUserDesiredGraph(arr[0]);  // Tell function to make x amt of graphs
			} else if(arr[0] > MAX_CUSTOM_GRAPHS) {
				alert(`Input is more than max graphs: ${arr[0]}/${MAX_CUSTOM_GRAPHS}.`);
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
				return;
			} else if(arr[0] <= 0) {
				alert('You need at least one graph in order to build a query.')
				$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
				return;
			}
		} else {
			alert(`Regex denied submission. Submit a number between 1 and ${MAX_CUSTOM_GRAPHS}.`);
			$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
			return;
		}
	}
}

//Function to return the specific graphs the user wants to use
function chooseQueryGraphs(number_of_graphs) {
	var HTML = '';
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	//Get the specified query
	var query = 'SELECT DISTINCT ?g '+
				'WHERE { ' +
				'GRAPH ?g { ?s ?p ?o } ' +
				'}' ; 
	
	//HTTP encode the query
	query = encodeURIComponent(query);
	//Create the URL for the HTTP request
	var http_get = MARMOTTA_SPARQL_URL + query;
	// execute sparql query in marmotta
	$.get({url: http_get, 
		success: function(result) {
			//If there are no results say so. Otherwise, visualize them.
			if(!result) {
				notification_manager.addToNotificationQueue('Warning', 'No results while finding graphs.');
			}
			else {
				bindings = result.results.bindings;
				// Check how many results there are. If 0 throw an error. Otherwise, visualize them.
				if(bindings.length > 0) {
					if(query_tab_list[id_sliced].current_custom_graphs == number_of_graphs) {
						// Reload if user hits submit again
						// Update new section if graph number was changed
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
							$('#' + query_tab_id + '-qb-context-selector-' + i).remove();
						}
						$('#' + query_tab_id + '-section-graph-selection').remove();
						$('#' + query_tab_id + '-section-predicate-selection').remove();
						$('#' + query_tab_id + '-section-filter-selection').remove();
						$('#' + query_tab_id + '-section-query-selection').remove();
				
						$('#' + query_tab_id).append('<div class="" id="' + query_tab_id + '-section-graph-selection"></div><div class="" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="" id="' + query_tab_id + '-section-filter-selection"></div><div class="" id="' + query_tab_id + '-section-query-selection"></div>')
						$('#' + query_tab_id + '-section-graph-selection').append('<p class="qb-text" id="' + query_tab_id + '-qb-text-graph-info">Choose what graphs you would like to query:</p>');
						// Update class variables
						query_tab_list[id_sliced].graph_context_values = [];
						query_tab_list[id_sliced].graph_predicate_values = [];
					} else if (query_tab_list[id_sliced].current_custom_graphs == 0) {
						// Create new section based
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						$('#' + query_tab_id + '-section-graph-selection').append('<p class="qb-text" id="' + query_tab_id + '-qb-text-graph-info">Choose what graphs you would like to query:</p>');
					} else {
						// Update new section if graph number was changed
						query_tab_list[id_sliced].current_custom_graphs = number_of_graphs;
						for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
							$('#' + query_tab_id + '-qb-context-selector-' + i).remove();
						}
						$('#' + query_tab_id + '-section-graph-selection').remove();
						$('#' + query_tab_id + '-section-predicate-selection').remove();
						$('#' + query_tab_id + '-section-filter-selection').remove();
						$('#' + query_tab_id + '-section-query-selection').remove();
				
						$('#' + query_tab_id).append('<div class="" id="' + query_tab_id + '-section-graph-selection"></div><div class="" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="" id="' + query_tab_id + '-section-filter-selection"></div><div class="" id="' + query_tab_id + '-section-query-selection"></div>')
						$('#' + query_tab_id + '-section-graph-selection').append('<p class="qb-text" id="' + query_tab_id + '-qb-text-graph-info">Choose what graphs you would like to query:</p>');
						// Update class variables
						query_tab_list[id_sliced].graph_context_values = [];
						query_tab_list[id_sliced].graph_predicate_values = [];
					}

					//go through all of the results.
					for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
						HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-context-selector-'+ i +'" title="Graph ' + i + '">';
						// Get Options
						for(var j = 0; j < bindings.length; j++) {
							//declare the variables given the results.
							context = bindings[j].g.value;
							//only include relevant contexts.
							if(context.includes("http://localhost:8080/marmotta/context/"))
							{
								var temp_string = '<option value="' + context + '">' + context + '</option>';
								HTML = HTML + temp_string;
							}
						}
						HTML += '</select>'
					}
					if(query_tab_list[id_sliced].current_custom_graphs > 1) {
						HTML += '<span class="qb-text" id="' + query_tab_id + '-qb-text-common-predicates">Would you like to show common predicates between the multiple graphs?</span>'
						HTML += '<input checked="true" id="' + query_tab_id + '-qb-radio-predicates-yes" name="predicates" type="radio" value="Yes"/>Yes<input id="' + query_tab_id + '-qb-radio-predicates-no" name="predicates" type="radio" value="No"/>No<br/>';
					}
					HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-find-query-predicates" type="button" onclick="findQueryPredicates();">Find Predicates</button><hr/>';				
					
					// Append to specific section inside query tab
					$('#' + query_tab_id + '-section-graph-selection').append(HTML);
					$('#' + query_tab_id + '-section-graph-selection .qb-select-dropdown').change(function() {
						query_tab_list[id_sliced].recalculateGraphValues();
					});

					// Setup checks for radio buttons (radio btns for common predicates only show if there's more than 1 graph)
					$('#' + query_tab_id + '-qb-radio-geo-predicates-yes').click(function() {
						if($('#' + query_tab_id + '-qb-radio-geo-predicates-yes').is(':checked')) {
							query_tab_list[id_sliced].show_common_predicates = true;
						}
					});
					$('#' + query_tab_id + '-qb-radio-geo-predicates-no').click(function() {
						if($('#' + query_tab_id + '-qb-radio-geo-predicates-no').is(':checked')) {
							query_tab_list[id_sliced].show_common_predicates = false;
						}
					});
				}
				else { //There was no results so do nothing.
					notification_manager.addToNotificationQueue('Error', 'No results for bindings while modifying query tab.');
				}
			}
		}
	});
}

//Function to return the predicates for the given context
function findQueryPredicates(){
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	// Disable button til all predicates are found
	$('#' + query_tab_id + '-qb-btn-find-query-predicates').attr('disabled', true);

	// Set default values for the class if nothing was changed before pressing Find Predicates
	if (query_tab_list[id_sliced].graph_context_values === undefined || query_tab_list[id_sliced].graph_context_values.length == 0) {
		for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			query_tab_list[id_sliced].graph_context_values.push($('#' + query_tab_id + '-qb-context-selector-' + i).val());
		}
	}

	// Check whether to show common predicates or not
	if($('#' + query_tab_id + '-qb-radio-predicates-yes').is(':checked')) {
		query_tab_list[id_sliced].show_common_predicates = true;
	} else if($('#' + query_tab_id + '-qb-radio-predicates-no').is(':checked')) {
		query_tab_list[id_sliced].show_common_predicates = false;
	}

	// Check whether we need to build elements
	if(query_tab_list[id_sliced].current_custom_predicates == query_tab_list[id_sliced].current_custom_graphs) {
		// Delete old information that will be rewritten
		for(var i = 0; i < query_tab_list[id_sliced].current_custom_graphs; i++) {
			$('#' + query_tab_id + '-qb-div-predicate-' + (i + 1)).remove();
		}
		$('#' + query_tab_id + '-section-predicate-selection hr').remove();

		// Check whether a selector for graph was changed. If so, graph_context_values will be different from the stored version old_graph_context_values
		if (query_tab_list[id_sliced].old_graph_context_values == query_tab_list[id_sliced].graph_context_values) {
			// Don't need to change the html
			return;
		} else {
			// Remove old graph predicates
			for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
				$('#' + query_tab_id + '-qb-predicate-selector-' + i).remove();
			}
			$('#' + query_tab_id + '-qb-btn-find-query-filters').remove();
		}
	} else if (query_tab_list[id_sliced].current_custom_predicates == 0) {
		// Create new section based
		query_tab_list[id_sliced].current_custom_predicates = query_tab_list[id_sliced].current_custom_graphs;
		$('#' + query_tab_id + '-section-predicate-selection').append('<p class="qb-text" id="' + query_tab_id + '-qb-text-predicate-info">Choose what predicates you would like to filter the selected graphs by:</p>');
	} else {
		query_tab_list[id_sliced].current_custom_predicates = query_tab_list[id_sliced].current_custom_graphs;
	}
	
	// Build divs to put predicate selections into
	query_tab_list[id_sliced].graph_context_values.forEach(function(item, index) {
		$('#' + query_tab_id + '-section-predicate-selection').append('<div id="' + query_tab_id + '-qb-div-predicate-' + (index + 1) + '"></div>');
	});

	var selected_graph = "";
	// Loop through user desired graphs and create predicates to choose from
	query_tab_list[id_sliced].graph_context_values.forEach(function(item, index) {
		selected_graph = 'FROM NAMED <' + item + '> ';
		index_updated = index + 1
		createPredicateSelections(index_updated, selected_graph);
		asyncPredicateWait();
	});

	// Create find filter options button
	$('#' + query_tab_id + '-section-predicate-selection').append('<button class="qb-button" id="' + query_tab_id + '-qb-btn-find-query-filters" type="button" onclick="findQueryFilters();">Find Filter Options</button><hr/>');
}

function asyncPredicateWait() {
	var id_sliced = query_tab_id.slice(5, 6) - 1;
	if(pending_predicates == true){
		setTimeout(() => {
			asyncPredicateWait();
		}, 1000);
	} else {
		// Delete options that are not common among multiple graphs if user specifies
		if(query_tab_list[id_sliced].current_custom_graphs > 1 && query_tab_list[id_sliced].show_common_predicates === true) {
			var predicates = [];  // List of lists, each list with predicates from a graph
			// Grab all predicates from each graph
			for(var i = 0; i < query_tab_list[id_sliced].current_custom_graphs; i++) {
				var new_list = [];
				$('#' + query_tab_id + '-qb-predicate-selector-' + (i + 1) + ' option').each(function() {
					new_list.push(this.value);
				});
				predicates.push(new_list);
			}

			// Find common elements
			var common_predicates = predicates.shift().reduce(function(res, v) {
				if (res.indexOf(v) === -1 && predicates.every(function(a) {
					return a.indexOf(v) !== -1;
				})) res.push(v);
				return res;
			}, []);

			if (jQuery.isEmptyObject(common_predicates)) {
				predicates = [];
			}

			// Compare options for each dropdown to the common elements list
			for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
				$('#' + query_tab_id + '-qb-predicate-selector-' + i + ' option').each(function() {
					var is_found = false;
					var option = this.value;  // have to set option to get the value of 'this' since scope would be an issue
					common_predicates.forEach(function(item, index) {
						if(item == option) {
							is_found = true;
						}
					});
					// If dropdown option not found in common elements, delete it
					if(is_found == false) {
						$('#' + query_tab_id + '-qb-predicate-selector-' + i + ' option[value="' + option + '"]').remove();
					}
				});
			}
		
			if(jQuery.isEmptyObject(predicates)) {
				notification_manager.addToNotificationQueue('Warning', 'Query builder failed to find common predicates among the selected graphs.');
			}

			// TODO: Rearrange all options into alphabetical order
			// NOTE: May have to put options in a list, sort list, and then build the options again
			// for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			// 	var select_list = $('#' + query_tab_id + '-qb-predicate-selector-' + i + ' option')
			// 	select_list.sort();
			// 	$('#' + query_tab_id + '-qb-predicate-selector-' + i).html(select_list);
			// }
		}

		// Delete extra predicate selections if user spam clicks the find predicates button
		for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			if($('#' + query_tab_id + '-qb-div-predicate-' + i + ' select').length > 1){
				for(var j = 0; j < $('#' + query_tab_id + '-qb-div-predicate-' + i + ' select').length; j++) {
					$('#' + query_tab_id + '-qb-div-predicate-' + i + ' > select:nth-child(' + (j + 2) +')').remove();
				}
			}
		}
		$('#' + query_tab_id + '-qb-btn-find-query-predicates').attr('disabled', false);
	}
}
function createPredicateSelections(index, selected_graph) {
	var div_html = '';
	var HTML = '';
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	//Get the specified query
	var query = 'SELECT DISTINCT ?p '+ selected_graph +
	'WHERE { ' +
	'GRAPH ?g { ?s ?p ?o } ' +
	'}';

	//HTTP encode the query
	query = encodeURIComponent(query);
	//Create the URL for the HTTP request
	var http_get = MARMOTTA_SPARQL_URL + query;
	
	// execute sparql query in marmotta
	pending_predicates = true;
	$.get({url: http_get, 
		success: function(result) {
			//If there are no results say so. Otherwise, visualize them.
			if(!result) {
				notification_manager.addToNotificationQueue('Warning', 'No results while finding query predicates.');
			}
			else {
				bindings = result.results.bindings;
				//Check how many results there are. If 0 through an error. Otherwise, visualize them.
				if(bindings.length > 0) {
					//go through all of the results.
					var div_element = $('#' + query_tab_id + '-qb-div-predicate-' + index);
					div_html += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-predicate-selector-' + index + '" title="Predicate ' + index + '">';
					// Get options
					for(var j = 0; j < bindings.length; j++) {
						//declare the variables given the results.
						context = bindings[j].p.value;
						
						var temp_string = '<option value="' + context + '">' + context + '</option>';
						div_html += temp_string;
					}
					div_html += '</select>'
					div_element.append(div_html);
					// Append the content to the query_tab
					$('#' + query_tab_id).append(HTML);
					$('#' + query_tab_id + '-section-predicate-selection .qb-select-dropdown').change(function() {
						query_tab_list[id_sliced].recalculatePredicateValues();
					});
					pending_predicates = false;
				}
				else { //There was no results so do nothing.
					notification_manager.addToNotificationQueue('Error', 'No results for bindings while finding query predicates.');
				}
			}
		}
	});
}

//Function to gets filters for the given predicate
function findQueryFilters(){
	var id_sliced = query_tab_id.slice(5, 6) - 1;

	// Set default values for the class since we only update when it's changed
	if (query_tab_list[id_sliced].graph_predicate_values === undefined || query_tab_list[id_sliced].graph_predicate_values.length == 0) {
		for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			query_tab_list[id_sliced].graph_predicate_values.push($('#' + query_tab_id + '-qb-predicate-selector-' + i).val());
		}
	}

	if(document.getElementById(query_tab_id + '-qb-filter-selector-1') == null) {
		var HTML = '<p class="qb-text" id="' + query_tab_id + '-qb-text-filter-info">Choose how you want to filter each predicates:</p>'
		// NOTE: This needs to be updated when new graphs are implemented
		var string_predicates = ['http://dbpedia.org/ontology/address', 'http://dbpedia.org/ontology/administrativeDistrict', 'http://dbpedia.org/ontology/city',
								 'http://dbpedia.org/ontology/category', 'http://dbpedia.org/ontology/comment', 'http://dbpedia.org/ontology/county', 
								 'dct:creator', 'http://data.usgs.gov/ontology/structures/hasClass', 'http://data.usgs.gov/ontology/structures/hasCounty', 
								 'http://data.usgs.gov/ontology/structures/hasOfficialName', 'http://data.usgs.gov/ontology/structures/hasState',
								 'http://dbpedia.org/ontology/localAuthority', 'http://dbpedia.org/ontology/manager', 'http://dbpedia.org/ontology/otherName', 
								 'http://dbpedia.org/ontology/owner', 'http://dbpedia.org/ontology/purpose', 'http://dbpedia.org/ontology/state', 'dc:subject', 
								 'dc:title', 'http://purl.org/dc/elements/1.1/title'];
		var number_predicates = ['http://dbpedia.org/ontology/PopulatedPlace/area', 'http://www.opengis.net/ont/geosparql#dimension', 
								 'http://dbpedia.org/ontology/elevation', 'http://data.usgs.gov/ontology/structures/hasID', 'http://dbpedia.org/ontology/length',
								 'http://dbpedia.org/ontology/population', 'http://www.w3.org/2003/01/geo/wgs84_pos#lat', 
								 'http://www.w3.org/2003/01/geo/wgs84_pos#long', 'http://dbpedia.org/ontology/zipCode'];  // pos#lat pos#long
		var boolean_predicates = [];
		// For unknown predicates:  hasGeometry -> the_geom, sameAs is for Geonames-GNIS Structures-Geonames and Structures-GNIS, identifier is
		// from the cache graph
		var unknown_predicates = ['http://www.opengis.net/ont/geosparql#asGML', 'http://www.opengis.net/ont/geosparql#asWKT', 
								  'http://dbpedia.org/ontology/dateLastUpdated', 'dct:dateSubmitted', 'http://www.opengis.net/ont/geosparql#hasGeometry', 
								  'dc:identifier', 'http://www.w3.org/2002/07/owl#sameAs', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];

		// TODO: Based on predicate classification, add the filter options and only allow specific options for each predicate
		// Example: User wants the first predicate to be title but the second to be dimension. One is string and the other is a number
		// 			so we need to apply n filters and n buttons to change said filters.
		// Build x filters for n graphs
		for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
			HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-filter-selector-' + (i + 1) + '">';
			// Perform predicate checks
			var specific_predicate = query_tab_list[id_sliced].graph_predicate_values[i];
			for(var j = 0; j < string_predicates.length; j++) {
				if(specific_predicate == string_predicates[j] || specific_predicate == unknown_predicates[j]) {
					HTML += '<option value="regex">Contains String</option>';
				}
			}
			for(var j = 0; j < number_predicates.length; j++) {
				if(specific_predicate == number_predicates[j] || specific_predicate == unknown_predicates[j]) {
					HTML += '<option value="lessthan">Is Less Than</option>';
					HTML += '<option value="lessthanorequal">Is Less Than Or Equal</option>';
					HTML += '<option value="greaterthan">Is Greater Than</option>';
					HTML += '<option value="greaterthanorequal">Is Greater Than Or Equal</option>';
					HTML += '<option value="equalto">Is Equal To</option>';
					HTML += '<option value="notequalto">Is Not Equal To</option>';
				}
			}
			HTML += '<option value="none">None</option>';
				
			HTML += '</select>';
		}
		HTML += '<p class="qb-text" id="' + query_tab_id + '-qb-text-filter-compare-info">What do you want to compare the objects to?</p>';
		// Add input sources for user to type what they want to compare to their chosen predicate(s)
		for(var i = 0; i < query_tab_list[id_sliced].current_custom_graphs; i++) {
			HTML += '<input class="qb-input-graph-filter" id="' + query_tab_id + '-qb-input-graph-filter-' + (i + 1) + '" name="graph-filter" title="Text to filter for graph ' + (i + 1) + '" type="text" value=""/>'
		}
		HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-generate-query" type="button" onclick="checkUserQueryValidity(\'Graph Filter\');">Generate Query</button><hr/>';
						
		//append the content to the query_tab
		$('#' + query_tab_id + '-section-filter-selection').append(HTML);

		// Allow full value selection on click
		for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			$('#' + query_tab_id + '-qb-input-graph-filter-' + i).focus(function() {
				$(this).on("click.a keyup.a", function(e){      
					$(this).off("click.a keyup.a").select();
				});
			});
		}
	}
	else 
	{
		// We will update the select once this becomes dynamic.
	}			
}

//This function generates the sparql query and shows it in the sparql textarea.
function generateQuery(){
	var id_sliced = query_tab_id.slice(5, 6) - 1;
	var selected_filters = [];
	var filter_objects_list = [];
	// TODO: Add geosparql capabilities
	
	// Graph specific filter vals
	for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
		selected_filters.push($('#' + query_tab_id + '-qb-filter-selector-' + (i + 1)).val());
	}

	// Graph user input on filters
	for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
		var filter_object = $('#' + query_tab_id + '-qb-input-graph-filter-' + i);
		// Apply user input to list if user gave niput
		if(filter_object.val() != '') {
			filter_objects_list.push(filter_object.val());
		}
	}
	
	// Generate the selected graphs
	var selected_graphs = '';	
	query_tab_list[id_sliced].graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <' + item + '> ';
	});
	
	// Generate the subject, predicate, object, and filter statements
	var selected_filters_qb_text = [];
	for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
		var filter_object_value = '';
		// If user input doesn't exist then fill with blank
		if(jQuery.isEmptyObject(filter_objects_list) && selected_filters[i] != 'regex') {
			filter_object_value = '\"\"';
		} else if (jQuery.isEmptyObject(filter_objects_list) && selected_filters[i] == 'regex') {
			filter_object_value = '';
		} else {
			filter_object_value = filter_objects_list[i];
		}
		if(selected_filters[i] == 'regex')
			selected_filters_qb_text.push('regex(?filter_obj' + i + ', "' + filter_object_value + '") ');
		else if (selected_filters[i] == 'lessthan')
			selected_filters_qb_text.push('(?filter_obj' + i + ' < ' + filter_object_value + ')');
		else if (selected_filters[i] == 'lessthanorequal')
			selected_filters_qb_text.push('(?filter_obj' + i + ' <= ' + filter_object_value + ')');
		else if (selected_filters[i] == 'greaterthan')
			selected_filters_qb_text.push('(?filter_obj' + i + ' > ' + filter_object_value + ')');
		else if (selected_filters[i] == 'greaterthanorequal')
			selected_filters_qb_text.push('(?filter_obj' + i + ' >= ' + filter_object_value + ')');
		else if (selected_filters[i] == 'equalto')
			selected_filters_qb_text.push('(?filter_obj' + i + ' = ' + filter_object_value + ')');
		else if (selected_filters[i] == 'notequalto')
			selected_filters_qb_text.push('(?filter_obj' + i + ' != ' + filter_object_value + ')');
		else if (selected_filters[i] == 'none') {
			// Pass
		}
	}
	
	// Build the query based on single/multiple graphs
	var query = '';
	var query_intro = '';
	var query_graph = '';
	var query_outro = '';
	var query_intro = 'SELECT ?subject ?geom ?name ?purpose (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR=";") AS ?geometry) ' +
					  selected_graphs + 'WHERE { ';
					  
	query_graph += 'GRAPH ?g { ' +
					'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + 
					'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ';
	
	// Add specific geometry statements
	// TODO: What to do when there are no predicates
	var geom_predicates = ['http://www.opengis.net/ont/geosparql#asGML', 'http://www.opengis.net/ont/geosparql#asWKT', 'http://www.opengis.net/ont/geosparql#dimension'];
	var is_geom = false;
	for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
		// Check against geom predicates
		for(var j = 0; j < geom_predicates.length; j++) {
			if(query_tab_list[id_sliced].graph_predicate_values[i] == geom_predicates[j]) {
				query_graph += 'OPTIONAL { ?geom <' + query_tab_list[id_sliced].graph_predicate_values[i] + '> ?filter_obj' + i + ' . } ';
				is_geom = true;
			}
		}
		// If not geom, attach as regular triple
		if(is_geom == false) {
			query_graph += 'OPTIONAL { ?subject <' + query_tab_list[id_sliced].graph_predicate_values[i] + '> ?filter_obj' + i + ' . } ';
		} else {
			is_geom = false;
		}
	}

	// Add optional statements
	query_graph += 'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
				   'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ';
	
	// Make sure we want filters
	if(selected_filters_qb_text.length >= 1) {
		query_graph += 'FILTER (';
		// Add filter statements
		for(var i = 0; i < selected_filters_qb_text.length; i++) {
			query_graph += '(' + selected_filters_qb_text[i] + ' && ?g = <' + query_tab_list[id_sliced].graph_context_values[i] + '>)';
			// Make sure we only add boolean 'or' if it's not the last filter option, otherwise it'll fail the query
			if((i + 1) != selected_filters_qb_text.length) {
				query_graph += ' || ';
			}
		}
		query_graph += ')';
	}
	query_outro = '} } GROUP BY ?subject ?geom ?name ?purpose ' ;
	
	// Combine, send it!
	query = query_intro + query_graph + query_outro

	if(document.getElementById(query_tab_id + '-qb-generated-query') == null)
	{
		var HTML = '<textarea class="qb-text-area" cols="50" rows="20" id="' + query_tab_id + '-qb-generated-query"></textarea>'
					+ '<button class="qb-run-query qb-button" id="' + query_tab_id + '-qb-run-query" type="button" onclick="getQueryField()">Run Query</button>'
					+ '<button class="qb-clear-map qb-button" id="' + query_tab_id + '-qb-clear-map" type="button" onclick="clearMap()">Clear Map</button>';

		//append the content to the query_tab
		$('#' + query_tab_id + '-section-filter-selection').append(HTML);
		$('#' + query_tab_id + '-qb-generated-query').val(query);
	}
	else
	{
		$('#' + query_tab_id + '-qb-generated-query').val(query);
	}
}

// ###################### //
// ### Misc Functions ### //
// ###################### //

// Function to keep the old selection whether the query is successful or not
function setSelect(){
	try {
		var id_sliced = query_tab_id.slice(5, 6) - 1;

		// TODO: Make sure all selected_ are replaced with loops over all context, predicate, and filter selectors
		query_tab_list[id_sliced].graph_context_values.forEach(function(item, index) {
			new_index = index + 1;
			if($('#' + query_tab_id + '-qb-context-selector-' + new_index) != null) {
				$('#' + query_tab_id + '-qb-context-selector-' + new_index).val(item);
			}
		});
		query_tab_list[id_sliced].graph_predicate_values.forEach(function(item, index) {
			new_index = index + 1;
			if($('#' + query_tab_id + '-qb-predicate-selector-' + new_index) != null)
				$('#' + query_tab_id + '-qb-predicate-selector-' + new_index).val(item);
		});
	} catch (err) {
		notification_manager.addToNotificationQueue('Error', 'With setSelect(): ' + err);
}
}

//Function to get the query from the query field and then run the universal query functon
function getQueryField(){
	makeUniversalQuery('Custom');
}