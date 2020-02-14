// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for custom query builder operations.

const MAX_CUSTOM_QUERIES = 3;
const MAX_CUSTOM_GRAPHS = 15;

var current_custom_queries = 0;
var query_tab_list = [];
var selected_f = 0;
var selected_comparison = '';

class QueryTab {
	constructor(id) {
		this.tab_id = id;
		this.current_custom_graphs = 0;  // 
		this.current_custom_predicates = 0;  // 
		this.graph_context_values = [];  // Used to hold all graphs for each tab
		this.graph_predicate_values = [];  // Used to hold all predicates for each tab
	}
}

//Function to display the query as a tab
function createQueryTab(){
	// Check whether max queries are already open
	if (current_custom_queries == MAX_CUSTOM_QUERIES) {
		return;
	} else {
		current_custom_queries += 1;
		query_tab_list.push(new QueryTab(current_custom_queries));
		query_tab_id = 'tabs-' + current_custom_queries;
		var HTML = '<span class="qb-text" id="' + query_tab_id + '-qb-text-graph-number">How many graphs would you like:</span>'
					+ '<input class="qb-input-graph-number" id="' + query_tab_id + '-qb-input-graph-number" name="graph-number" title="Number between 1-' + MAX_CUSTOM_GRAPHS + '" type="text" value="Number here"/>'
					+ '<button id="' + query_tab_id + '-qb-btn-graph-number-submit" type="button" onclick="checkUserQueryValidity(\'Graph Number\');">Submit</button>'
		createTab('Query Builder', HTML);

		// Allow full value selection on click <-- seems to not work after hitting submit btn
		$('#' + query_tab_id + '-qb-input-graph-number').focus(function() {
			$(this).on("click.a keyup.a", function(e){      
				$(this).off("click.a keyup.a").select();
			});
		});
	}
}

// A function that checks the validy of different inputs from the user.
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
	}
}

//Function to return the specific graphs the user wants to use
function chooseQueryGraphs(number_of_graphs) {
	var HTML = '';
	var query_tab = document.getElementById(query_tab_id);
	var id_sliced = query_tab_id.slice(5, 6);

	if(query_tab_list[id_sliced - 1].current_custom_graphs == number_of_graphs) {
		// Don't need to change the html
		return;
	} else if (query_tab_list[id_sliced - 1].current_custom_graphs == 0) {
		// Create new section based
		query_tab_list[id_sliced - 1].current_custom_graphs = number_of_graphs;
		var HTML = '<p class="qb-text" id="' + query_tab_id + '-qb-text-graph-info">Choose what graphs you would like to query:</p>'
	} else {
		// Update new section if graph number was changed
		query_tab_list[id_sliced - 1].current_custom_graphs = number_of_graphs;
		for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
			$('#' + query_tab_id + '-qb-context-selector-' + i).remove();
		}
		$('#' + query_tab_id + '-qb-btn-find-query-predicates').remove();

		// Remove predicate divs, dropdowns, text, and buttons
		for(var i = 1; i <= MAX_CUSTOM_GRAPHS; i++) {
			$('#' + query_tab_id + '-qb-predicate-selector-' + i).remove();
			$('#' + query_tab_id + '-qb-div-predicate-' + i).remove();
		}
		$('#' + query_tab_id + '-qb-text-predicate-info').remove();
		$('#' + query_tab_id + '-qb-btn-find-query-filters').remove();

		// Remove filter dropdowns, text, and buttons
		$('#' + query_tab_id + '-qb-text-filter-info').remove();
		$('#' + query_tab_id + '-qb-filter-selector').remove();
		$('#' + query_tab_id + '-qb-text-filter-compare-info').remove();
		$('#' + query_tab_id + '-qb-filter-object').remove();
		$('#' + query_tab_id + '-qb-btn-generate-query').remove();

		// Remove generated query section
		$('#' + query_tab_id + '-qb-generated-query').remove();
		$('#' + query_tab_id + '-qb-run-query').remove();
		$('#' + query_tab_id + '-qb-clear-map').remove();
	}
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
					//go through all of the results.
					for(var i = 1; i <= query_tab_list[id_sliced - 1].current_custom_graphs; i++) {
						HTML += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-context-selector-'+ i +'">';
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
					HTML += '<button id="' + query_tab_id + '-qb-btn-find-query-predicates" type="button" onclick="findQueryPredicates();">Find Predicates</button>';				
					query_tab.innerHTML += HTML
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
	var query_tab = document.getElementById(query_tab_id);
	var id_sliced = query_tab_id.slice(5, 6);
	// Get all values of the chosen graphs
	for(i = 1; i <= query_tab_list[id_sliced - 1].current_custom_graphs; i++) {
		query_tab_list[id_sliced - 1].graph_context_values.push($('#' + query_tab_id + '-qb-context-selector-' + i).val());
	}


	// Check whether we need to build elements
	if(query_tab_list[id_sliced - 1].current_custom_predicates == query_tab_list[id_sliced - 1].current_custom_graphs) {
		// Don't need to change the html
		return;
	} else if (query_tab_list[id_sliced - 1].current_custom_predicates == 0) {
		// Create new section based
		query_tab_list[id_sliced - 1].current_custom_predicates = query_tab_list[id_sliced - 1].current_custom_graphs;
		query_tab.innerHTML += '<p class="qb-text" id="' + query_tab_id + '-qb-text-predicate-info">Choose what predicates you would like to filter the selected graphs by:</p>' 
	} else {
		query_tab_list[id_sliced - 1].current_custom_predicates = query_tab_list[id_sliced - 1].current_custom_graphs;
	}
	query_tab_list[id_sliced - 1].graph_context_values.forEach(function(item, index) {
		// Build divs to put predicate selections into
		query_tab.innerHTML += '<div id="' + query_tab_id + '-qb-div-predicate-' + (index + 1) + '"></div>'
	});

	var selected_graph = "";
	// Loop through user desired graphs and create predicates to choose from
	query_tab_list[id_sliced - 1].graph_context_values.forEach(function(item, index) {
		selected_graph = 'FROM NAMED <' + item + '> ';
		index_updated = index + 1
		createPredicateSelections(index_updated, query_tab, selected_graph);
	});
	// Create find filter options button
	query_tab.innerHTML += '<button id="' + query_tab_id + '-qb-btn-find-query-filters" type="button" onclick="findQueryFilters();">Find Filter Options</button>';
}

function createPredicateSelections(index, query_tab, selected_graph) {
	var div_html = '';
	var HTML = '';
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
					div_html += '<select class="qb-select-dropdown" id="' + query_tab_id + '-qb-predicate-selector-' + index + '">';
					// Get options
					for(var j = 0; j < bindings.length; j++) {
						//declare the variables given the results.
						context = bindings[j].p.value;
						
						var temp_string = '<option value="' + context + '">' + context + '</option>';
						div_html += temp_string;
					}
					div_html += '</select>'
					div_element.append(div_html);
					//append the content to the query_tab
					query_tab.innerHTML += HTML;
				}
				else { //There was no results so do nothing.
					notification_manager.addToNotificationQueue('Error', 'No results for bindings while finding query predicates.');
				}
			}
			//Whether we are successful or not, we should keep the same options selected
			set_Select();
		}
	});
}

//Function to gets filters for the given predicate
function findQueryFilters(){
	var query_tab = document.getElementById(query_tab_id);
	var id_sliced = query_tab_id.slice(5, 6);

	// Get all predicates of the chosen graphs
	for(i = 1; i <= query_tab_list[id_sliced - 1].current_custom_graphs; i++) {
		query_tab_list[id_sliced - 1].graph_predicate_values.push($('#' + query_tab_id + '-qb-predicate-selector-' + i).val());
	}
	
	if(document.getElementById(query_tab_id + '-qb-filter-selector') == null) {
		var HTML = '<p class="qb-text" id="' + query_tab_id + '-qb-text-filter-info">Choose how you want to filter the predicates:</p>'
					+ '<select class="qb-select-dropdown" id="'+ query_tab_id +'-qb-filter-selector">';
	
	/*if( predicates[0]=="http://dbpedia.org/ontology/zipCode"
	http://www.opengis.net/ont/geosparql#dimension	
	http://dbpedia.org/ontology/dateLastUpdated
	http://dbpedia.org/ontology/category
	http://dbpedia.org/ontology/otherName
	http://www.opengis.net/ont/geosparql#asGML
	http://www.w3.org/2003/01/geo/wgs84_pos#long
	http://dbpedia.org/ontology/manager
	http://dbpedia.org/ontology/comment
	http://dbpedia.org/ontology/localAuthority
	http://dbpedia.org/ontology/administrativeDistrict
	http://dbpedia.org/ontology/owner
	http://dbpedia.org/ontology/elevation
	http://www.w3.org/2003/01/geo/wgs84_pos#lat
	http://www.opengis.net/ont/geosparql#asWKT
	http://dbpedia.org/ontology/address
	http://dbpedia.org/ontology/purpose
	http://dbpedia.org/ontology/population
	http://dbpedia.org/ontology/state
	http://www.opengis.net/ont/geosparql#hasGeometry
	http://dbpedia.org/ontology/PopulatedPlace/area
	http://purl.org/dc/elements/1.1/identifier
	http://purl.org/dc/elements/1.1/title
	http://purl.org/dc/elements/1.1/subject
	http://purl.org/dc/elements/1.1/creator*/

	HTML += '<option value="regex">Contains String</option>';
	HTML += '<option value="lessthan">Is Less Than</option>';
	HTML += '<option value="lessthanorequal">Is Less Than Or Equal</option>';
	HTML += '<option value="greaterthan">Is Greater Than</option>';
	HTML += '<option value="greaterthanorequal">Is Greater Than Or Equal</option>';
	HTML += '<option value="equalto">Is Equal To</option>';
	HTML += '<option value="notequalto">Is Not Equal To</option>';
	HTML += '<option value="none">None</option>';
		
	HTML = HTML + '</select>'
	+ '<p class="qb-text" id="' + query_tab_id + '-qb-text-filter-compare-info">What do you want to compare the objects to?</p>'
	+ '<textarea class="qb-text-area" cols="50" rows="1" id="' + query_tab_id + '-qb-filter-object"></textarea>'
	+ '<button class="btn-generate-query" id="' + query_tab_id + '-qb-btn-generate-query" type="button" onclick="generateQuery();">Generate Query</button>';
					
	//append the content to the query_tab
	query_tab.innerHTML += HTML;
	}
	else 
	{
		//we will update the select once this becomes dynamic.
	}
	
	set_Select();			
}

//This function generates the sparql query and shows it in the sparql textarea.
function generateQuery(){
	var query_tab = document.getElementById(query_tab_id);
	var id_sliced = query_tab_id.slice(5, 6);
	
	// var predicates = document.getElementById(query_tab_id + '-qb-predicate-selector');
	// var select_p = predicates.options[predicates.selectedIndex].value;
	
	var filters = document.getElementById(query_tab_id + '-qb-filter-selector');
	var select_f = filters.options[filters.selectedIndex].value;
	
	var filter_object = document.getElementById(query_tab_id + '-qb-filter-object').value;
	
	selected_f = filters.selectedIndex;
	selected_comparison = filter_object;
	
	//Generate the selected graphs
	var selected_graphs = '';
	query_tab_list[id_sliced - 1].graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <' + item + '> ';
	});
	
	//Generate the predicate and filter statements
	var selected_predicates = '';
	var predicate_objects = '';
	var selected_filters = '';
	//for(var i = 0; i<predicates.length; i++)
	//{	
		//predicate_objects+= '?predicate'+i+' ';
		//selected_predicates+= '?subject <'+predicates[i]+'> ?predicate'+i+' ';
		
	//}
	
	//We must check if the predicate belongs to the geometry or the feature.
	//We change the subject of the the triple accordingly.
	// if(select_p.includes("geosparql"))
	// {
	// 	predicate_objects += '?predicate1 ';
	// 	selected_predicates += '?geom <'+ select_p +'> ?predicate1 . ';
	// }
	// else
	// {
	predicate_objects += '?predicate1 ';
	query_tab_list[id_sliced - 1].graph_predicate_values.forEach(function(item, index) {
		selected_predicates += '?subject <' + item + '> ?predicate1 . ';
	});
	// selected_predicates += '?subject <'+ select_p +'> ?predicate1 . ';
	// }
	
	if(select_f == "regex")
		selected_filters += 'FILTER regex(?predicate1 , "' + filter_object + '")  ';
	else if (select_f == "lessthan")
		selected_filters += 'FILTER (?predicate1 < ' + filter_object + ') ';
	else if (select_f == "lessthanorequal")
		selected_filters += 'FILTER (?predicate1 <= ' + filter_object + ') ';
	else if (select_f == "greaterthan")
		selected_filters += 'FILTER (?predicate1 > ' + filter_object + ') ';
	else if (select_f == "greaterthanorequal")
		selected_filters += 'FILTER (?predicate1 >= ' + filter_object + ') ';
	else if (select_f == "equalto")
		selected_filters += 'FILTER (?predicate1 = ' + filter_object + ') ';
	else if (select_f == "notequalto")
		selected_filters += 'FILTER (?predicate1 != ' + filter_object + ') ';
	
	//Get the specified query
	var query = 'SELECT ?subject ?geom ?name ?purpose ' + predicate_objects + ' (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' 
				+ selected_graphs +
		'WHERE { GRAPH ?g { ' + 
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + selected_predicates + 
		'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		' } ' +
		selected_filters +
		' } ' +
		'GROUP BY ?subject ?geom ?name ?purpose ' + predicate_objects + ' ' ;
	
	if(document.getElementById(query_tab_id + '-qb-generated-query') == null)
	{
		var HTML = '<textarea class="qb-text-area" cols="50" rows="20" id="' + query_tab_id + '-qb-generated-query">' + query + '</textarea>'
					+ '<button class="qb-run-query" id="' + query_tab_id + '-qb-run-query" type="button" onclick="getQueryField()">Run Query</button>'
					+ '<button class="qb-clear-map" id="' + query_tab_id + '-qb-clear-map" type="button" onclick="clearMap()">Clear Map</button>';

		//append the content to the query_tab
		query_tab.innerHTML += HTML;
	}
	else
	{
		document.getElementById(query_tab_id + '-qb-generated-query').value = query;
	}

	set_Select();
}
// ###################### //
// ### Misc Functions ### //
// ###################### //

// Function to keep the old selection whether the query is successful or not
function set_Select(){
	var id_sliced = query_tab_id.slice(5, 6);

	// TODO: Make sure all selected_ are replaced with loops over all context, predicate, and filter selectors
	query_tab_list[id_sliced - 1].graph_context_values.forEach(function(item, index) {
		new_index = index + 1;
		if($('#' + query_tab_id + '-qb-context-selector-' + new_index) != null)
			$('#' + query_tab_id + '-qb-context-selector-' + new_index).val(item);
	});
	query_tab_list[id_sliced - 1].graph_predicate_values.forEach(function(item, index) {
		new_index = index + 1;
		if($('#' + query_tab_id + '-qb-predicate-selector-' + new_index) != null)
			$('#' + query_tab_id + '-qb-predicate-selector-' + new_index).val(item);
	});
	if( document.getElementById(query_tab_id + '-qb-filter-selector') != null)
		document.getElementById(query_tab_id + '-qb-filter-selector').selectedIndex = selected_f;
	if( document.getElementById(query_tab_id + '-qb-filter-object') != null)
		document.getElementById(query_tab_id + '-qb-filter-object').value = selected_comparison;
	
}

//Function to get the query from the query field and then run the universal query functon
function getQueryField(){
	makeUniversalQuery('Custom');
}