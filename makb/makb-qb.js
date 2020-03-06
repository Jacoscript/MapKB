// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for custom query builder operations.

const MAX_CUSTOM_QUERIES = 3;
const MAX_CUSTOM_GRAPHS = 15;

var current_custom_queries = 0;
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
		return;
	} else {
		current_custom_queries += 1;
		query_tab_list.push(new QueryTab(current_custom_queries));
		query_tab_id = 'tabs-' + current_custom_queries;
		createTab('Query Builder', HTML);

		$('#' + query_tab_id + ' p').remove();
		var HTML = '<div class="qb-content-container" id="' + query_tab_id +'-section-intro"><span class="qb-text" id="' + query_tab_id + '-qb-text-graph-number">How many graphs would you like:</span>'
					+ '<input class="qb-input-graph-number" id="' + query_tab_id + '-qb-input-graph-number" name="graph-number" title="Number between 1-' + MAX_CUSTOM_GRAPHS + '" type="text" value="Number here"/>'
					+ '<button id="' + query_tab_id + '-qb-btn-graph-number-submit" type="button" onclick="checkUserQueryValidity(\'Graph Number\');">Submit</button></div>'
					+ '<div class="qb-content-container" id="' + query_tab_id + '-section-graph-selection"></div>'
					+ '<div class="qb-content-container" id="' + query_tab_id + '-section-predicate-selection"></div>'
					+ '<div class="qb-content-container" id="' + query_tab_id + '-section-filter-selection"></div>'
					+ '<div class="qb-content-container" id="' + query_tab_id + '-section-query-selection"></div>'
		$('#' + query_tab_id).append(HTML);
		// Allow full value selection on click
		$('#' + query_tab_id + '-qb-input-graph-number').focus(function() {
			$(this).on("click.a keyup.a", function(e){      
				$(this).off("click.a keyup.a").select();
			});
		});
	}
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
			alert(`Regex denied submission. Please submit a number between 1 and ${MAX_CUSTOM_GRAPHS}.`);
			$('#' + query_tab_id + '-qb-input-graph-number').css('border', '1px solid red');
			return;
		}
	}else if(type_of_input == 'Graph Filter') {
		// TODO: Check whether user submits specific filter type based on the filter dropdown selection
		generateQuery();
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
				//Check how many results there are. If 0 through an error. Otherwise, visualize them.
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
				
						$('#' + query_tab_id).append('<div class="qb-content-container" id="' + query_tab_id + '-section-graph-selection"></div><div class="qb-content-container" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="qb-content-container" id="' + query_tab_id + '-section-filter-selection"></div><div class="qb-content-container" id="' + query_tab_id + '-section-query-selection"></div>')
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
				
						$('#' + query_tab_id).append('<div class="qb-content-container" id="' + query_tab_id + '-section-graph-selection"></div><div class="qb-content-container" id="' + query_tab_id + '-section-predicate-selection"></div>'
													 + '<div class="qb-content-container" id="' + query_tab_id + '-section-filter-selection"></div><div class="qb-content-container" id="' + query_tab_id + '-section-query-selection"></div>')
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
					HTML += '<button id="' + query_tab_id + '-qb-btn-find-query-predicates" type="button" onclick="findQueryPredicates();">Find Predicates</button><hr/>';				
					
					// Append to specific section inside query tab
					$('#' + query_tab_id + '-section-graph-selection').append(HTML);
					$('#' + query_tab_id + '-section-graph-selection .qb-select-dropdown').change(function() {
						query_tab_list[id_sliced].recalculateGraphValues();
					});

					// Setup checks for radio buttons (radio btns for common predicates only show if there's more than 1 graph)
					$('#' + query_tab_id + '-qb-radio-predicates-yes').click(function() {
						if($('#' + query_tab_id + '-qb-radio-predicates-yes').is(':checked')) {
							query_tab_list[id_sliced].show_common_predicates = true;
						}
					});
					$('#' + query_tab_id + '-qb-radio-predicates-no').click(function() {
						if($('#' + query_tab_id + '-qb-radio-predicates-no').is(':checked')) {
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
	});

	// Delete options that are not common among multiple graphs if user specifies
	if(query_tab_list[id_sliced].current_custom_graphs > 1 && query_tab_list[id_sliced].show_common_predicates === true) {
		var predicates = [];
		setTimeout(function() {
			// Grab all predicates
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

			// Compare options for each dropdown to the common elements list
			for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
				$('#' + query_tab_id + '-qb-predicate-selector-' + i + ' option').each(function() {
					var is_found = false;
					var option = this.value;  // have to set option to get the value of 'this' since scope wold be an issue
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

			// TODO: Rearrange all options into alphabetical order
			// NOTE: May have to put options in a list, sort list, and then build the options again
			// for(var i = 1; i <= query_tab_list[id_sliced].current_custom_graphs; i++) {
			// 	var select_list = $('#' + query_tab_id + '-qb-predicate-selector-' + i + ' option')
			// 	select_list.sort();
			// 	$('#' + query_tab_id + '-qb-predicate-selector-' + i).html(select_list);
			// }
			
		}, 500);  // 500 gives enough time for asynch callback of predicates before parsing predicates
	}

	// Create find filter options button
	$('#' + query_tab_id + '-section-predicate-selection').append('<button id="' + query_tab_id + '-qb-btn-find-query-filters" type="button" onclick="findQueryFilters();">Find Filter Options</button><hr/>');
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
								  'dc:identifier', 'http://www.w3.org/2002/07/owl#sameAs'];

		// TODO: Based on predicate classification, add the filter options and only allow specific options for each predicate
		// Example: User wants the first predicate to be title but the second to be dimension. One is string and the other is a number
		// 			so we need to apply n filters and n buttons to change said filters.
		// Build x filters for n graphs
		for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
			HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-filter-selector-' + (i + 1) + '">';
			// Perform predicate checks
			var specific_predicate = query_tab_list[id_sliced].graph_predicate_values[i];
			for(var j = 0; j < string_predicates.length; j++) {
				if(specific_predicate == string_predicates[j]) {
					HTML += '<option value="regex">Contains String</option>';
				}
			}
			for(var j = 0; j < number_predicates.length; j++) {
				if(specific_predicate == number_predicates[j]) {
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
		HTML += '<button class="btn-generate-query" id="' + query_tab_id + '-qb-btn-generate-query" type="button" onclick="checkUserQueryValidity(\'Graph Filter\');">Generate Query</button><hr/>';
						
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
		filter_objects_list.push(filter_object.val());
	}
	
	// Generate the selected graphs
	var selected_graphs = '';
	query_tab_list[id_sliced].graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <' + item + '> ';
	});
	
	// Generate the subject, predicate, object, and filter statements
	var selected_filters_qb_text = [];
	
	for(var i = 0; i < query_tab_list[id_sliced].current_custom_predicates; i++) {
		if(selected_filters[i] == "regex")
			selected_filters_qb_text.push('FILTER regex(?filter_obj' + i + ', "' + filter_objects_list[i] + '") ');
		else if (selected_filters[i] == "lessthan")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' < ' + filter_objects_list[i] + ')');
		else if (selected_filters[i] == "lessthanorequal")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' <= ' + filter_objects_list[i] + ')');
		else if (selected_filters[i] == "greaterthan")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' > ' + filter_objects_list[i] + ')');
		else if (selected_filters[i] == "greaterthanorequal")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' >= ' + filter_objects_list[i] + ')');
		else if (selected_filters[i] == "equalto")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' = ' + filter_objects_list[i] + ')');
		else if (selected_filters[i] == "notequalto")
			selected_filters_qb_text.push('FILTER (?filter_obj' + i + ' != ' + filter_objects_list[i] + ')');
	}
	
	// Build the query based on single/multiple graphs
	// TODO: Fix more than 2 graphs not working with the query
	var query = '';
	var query_intro = '';
	var query_graph = '';
	var query_outro = '';
	var query_intro = 'PREFIX graph: <http://localhost:8080/marmotta/context/> ' + 
		'SELECT ?subject ?geom ?name ?purpose (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
		selected_graphs +
		'WHERE { { ';
	for(var i = 0; i < query_tab_list[id_sliced].current_custom_graphs; i++) {
		var specific_graph = query_tab_list[id_sliced].graph_context_values[i];
		// Check whether filter is on geometry predicate or not
		if(selected_filters[i] == 'regex') {
		query_graph += 'GRAPH graph:' + specific_graph.substring(specific_graph.lastIndexOf('/') + 1, specific_graph.length) + ' { ' +
					   '?subject <' + query_tab_list[id_sliced].graph_predicate_values[i] + '> ?filter_obj' + i + ' . ' +
					   '?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + 
					   '?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ';
		} else{
			// If on geomtry predicate, we need to reformat the query so that the filter works on the geom not the subject
			var geom_predicates = ['http://www.opengis.net/ont/geosparql#asGML', 'http://www.opengis.net/ont/geosparql#asWKT', 'http://www.opengis.net/ont/geosparql#dimension'];
			for(var j = 0; j < geom_predicates.length; j++) {
				if(query_tab_list[id_sliced].graph_predicate_values[i] == geom_predicates[j]) {
					query_graph += 'GRAPH graph:' + specific_graph.substring(specific_graph.lastIndexOf('/') + 1, specific_graph.length) + ' { ' +
						'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + 
						'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' + 
						'?geom <' + query_tab_list[id_sliced].graph_predicate_values[i] + '> ?filter_obj' + i + ' . ';
				}
			}
		}
		// Add specific geometry statements

		// Add optional statements
		query_graph += 'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
					   'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
					   ' } ' + selected_filters_qb_text[i] + '} ';
		if ((i + 1) != query_tab_list[id_sliced].current_custom_graphs) {
			query_graph += 'UNION { ';
		}
	}
	query_outro = ' } GROUP BY ?subject ?geom ?name ?purpose ' ;
	
	// Combine, send it!
	query = query_intro + query_graph + query_outro

	if(document.getElementById(query_tab_id + '-qb-generated-query') == null)
	{
		var HTML = '<textarea class="qb-text-area" cols="50" rows="20" id="' + query_tab_id + '-qb-generated-query"></textarea>'
					+ '<button class="qb-run-query" id="' + query_tab_id + '-qb-run-query" type="button" onclick="getQueryField()">Run Query</button>'
					+ '<button class="qb-clear-map" id="' + query_tab_id + '-qb-clear-map" type="button" onclick="clearMap()">Clear Map</button>';

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