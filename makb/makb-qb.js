// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for custom query builder operations.

const MAX_CUSTOM_QUERIES = 3;
const MAX_CUSTOM_GRAPHS = 15;
// TODO: Tab id fix could be fixed by updating the specific
var current_custom_graphs = 0;  // TODO: Fix for tab id
var current_custom_predicates = 0;  // TODO: Fix for tab id
var current_custom_queries = 0;  // TODO: Fix for tab id
var graph_context_values = [];  // TODO: Add a tab id to list
var graph_predicate_values = [];  // TODO: Add a tab id to list
var selected_f = 0;
var selected_comparison = '';

//Function to display the query as a tab
function createQueryTab(){
	// Check whether max queries are already open
	if (current_custom_queries == MAX_CUSTOM_QUERIES) {
		return;
	} else {
		current_custom_queries += 1;
		query_tab_id = 'tabs-' + current_custom_queries;
		var HTML = '<p id="text-graph-number" style="font-size:15px; margin: 0px;">How many graphs would you like:</p>'
					+ '<input id="' + query_tab_id + '-query-input-graph-number" name="graph-number" title="Number between 1-10" type="text" value="Number here"/>'
					+ '<button id="btn-graph-number-submit" type="button" onclick="checkUserQueryValidity(\'Graph Number\');">Submit</button>'
		createTab('Query Builder', HTML);

		// Allow full value selection on click <-- seems to not work after hitting submit btn
		$('#' + query_tab_id + '-query-input-graph-number').focus(function() {
			$(this).on("click.a keyup.a", function(e){      
				$(this).off("click.a keyup.a").select();
			});
		});
	}
}

//Function to return the specific graphs the user wants to use
function chooseQueryGraphs(number_of_graphs) {
	var HTML = '';
	var query_tab = document.getElementById(query_tab_id);

	if(current_custom_graphs == number_of_graphs) {
		// Don't need to change the html
		return;
	} else if (current_custom_graphs == 0) {
		// Create new section based
		current_custom_graphs = number_of_graphs;
		var HTML = '<p id="' + query_tab_id + 'text-graph-info" style="font-size:15px">Choose what graphs you would like to query:</p>'
	} else {
		// TODO: Weird text shows up, 'undefined', so its probably from some update gone wrong
		// Update new section if graph number was changed
		current_custom_graphs = number_of_graphs;
		for(var i = 1; i <= current_custom_graphs; i++) {
			$('#' + query_tab_id + '-query-context-selector-' + i).remove();
		}
		$('#' + query_tab_id + 'btn-find-query-predicates').remove();

		// Remove predicate dropdowns, text, and button
		for(var i = 1; i <= current_custom_graphs; i++) {
			$('#' + query_tab_id + '-query-predicate-selector-' + i).remove();
		}
		$('#' + query_tab_id + 'text-predicate-info').remove();
		$('#' + query_tab_id + 'btn-find-query-filters').remove();

		// Remove filter dropdowns, text, and buttons
		$('#' + query_tab_id + 'text-filter-info').remove();
		$('#' + query_tab_id + '-query-filter-selector').remove();
		$('#' + query_tab_id + 'text-filter-compare-info').remove();
		$('#' + query_tab_id + '-query-filter-object').remove();
		$('#' + query_tab_id + 'btn-generate-query').remove();

		// Remove generated query section
		$('#' + query_tab_id + '-qb-generated-query').remove();
		$('#' + query_tab_id + 'qb-run-query').remove();
		$('#' + query_tab_id + 'qb-clear-map').remove();
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
					for(var i = 1; i <= current_custom_graphs; i++) {
						// TODO: Fix below line to better reflect which graph you're working on
						HTML += '<select style="font-size: 10px; margin-top: 5px; margin-bottom: 5px; width: 95%;" id="'+ query_tab_id +'-query-context-selector-'+ i +'">';
						// Get Options
						for(var j = 0; j < bindings.length; j++) {
							//declare the variables given the results.
							context = bindings[j].g.value;
							//only include relevant contexts.
							if(context.includes("http://localhost:8080/marmotta/context/"))
							{
								var temp_string = '<option value="'+context+'">'+ context +'</option>';
								HTML = HTML + temp_string;
							}
						}
						HTML += '</select>'
					}
					HTML += '<button id="'+ query_tab_id +'btn-find-query-predicates" type="button" onclick="findQueryPredicates();">Find Predicates</button>';				
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
	var HTML = '';
	var query_tab = document.getElementById(query_tab_id);

	// Get all values of the chosen graphs
	graph_context_values = [];
	for(i = 1; i <= current_custom_graphs; i++) {
		// graph_context_values.push({id : query_tab_id, value : $('#' + query_tab_id + '-query-context-selector-' + i).val()})
		graph_context_values.push({value : $('#' + query_tab_id + '-query-context-selector-' + i).val()})
	}

	if(current_custom_predicates == current_custom_graphs) {
		// Don't need to change the html
		return;
	} else if (current_custom_predicates == 0) {
		// Create new section based
		current_custom_predicates = current_custom_graphs;
		HTML = '<p id="' + query_tab_id + 'text-predicate-info" style="font-size:15px">Choose what predicates you would like to filter the selected graphs by:</p>' 
	}
	
	// TODO: Below line might not be needed
	// var context = document.getElementById(query_tab_id + '-query-context-selector');
	// var value = context.options[context.selectedIndex].value;
	// selected_c = context.selectedIndex;

	var selected_graphs = "";
	graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <'+ item.value +'> ';
	});
	
	//Get the specified query
	var query = 'SELECT DISTINCT ?p '+ selected_graphs +
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
				notification_manager.addToNotificationQueue('Warning', 'No results while finding query predicates.');
			}
			else {
				bindings = result.results.bindings;
				//Check how many results there are. If 0 through an error. Otherwise, visualize them.
				if(bindings.length > 0) {
					//go through all of the results.
					for(var i = 1; i <= current_custom_graphs; i++) {
						HTML += '<select style="font-size:10px; margin-top: 5px; margin-bottom: 5px; width: 95%;" id="'+ query_tab_id +'-query-predicate-selector-' + i + '">';
						// Get options
						for(var j = 0; j < bindings.length; j++) {
							//declare the variables given the results.
							context = bindings[j].p.value;
							
							var temp_string = '<option value="'+ context +'">'+ context +'</option>';
							HTML = HTML + temp_string;
						}
						HTML += '</select>'
					}
					HTML += '<button id="' + query_tab_id + 'btn-find-query-filters" type="button" onclick="findQueryFilters();">Find Filter Options</button>';
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
	// Get all predicates of the chosen graphs
	graph_predicate_values = [];
	for(i = 1; i <= current_custom_graphs; i++) {
		graph_predicate_values.push({value : $('#' + query_tab_id + '-query-predicate-selector-' + i).val()})
	}
	
	if(document.getElementById(query_tab_id + '-query-filter-selector') == null) {
		var HTML = '<p id="' + query_tab_id + 'text-filter-info" style="font-size:15px">Choose how you want to filter the predicates:</p>'
					+ '<select id="'+ query_tab_id +'-query-filter-selector" style="font-size:10px, margin-top: 5px; margin-bottom: 5px; width: 95%;">';
	
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
	+ '<p id="' + query_tab_id + 'text-filter-compare-info" style="font-size:15px";>What do you want to compare the objects to?</p>'
	+ '<textarea cols="50" rows="1" id="'+ query_tab_id +'-query-filter-object" style="resize:none; font-size: 12px; width: 100%;"></textarea>'
	+ '<button id="' + query_tab_id + 'btn-generate-query" type="button" onclick="generateQuery();">Generate Query</button>';
					
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
	
	// var predicates = document.getElementById(query_tab_id + '-query-predicate-selector');
	// var select_p = predicates.options[predicates.selectedIndex].value;
	
	var filters = document.getElementById(query_tab_id + '-query-filter-selector');
	var select_f = filters.options[filters.selectedIndex].value;
	
	var filter_object = document.getElementById(query_tab_id + '-query-filter-object').value;
	
	selected_f = filters.selectedIndex;
	selected_comparison = filter_object;
	
	//Generate the selected graphs
	var selected_graphs = '';
	graph_context_values.forEach(function(item, index) {
		selected_graphs += 'FROM NAMED <'+ item.value +'> ';
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
	graph_predicate_values.forEach(function(item, index) {
		selected_predicates += '?subject <'+ item.value +'> ?predicate1 . ';
	});
	// selected_predicates += '?subject <'+ select_p +'> ?predicate1 . ';
	// }
	
	if(select_f == "regex")
		selected_filters += 'FILTER regex(?predicate1 , "'+ filter_object +'")  ';
	else if (select_f == "lessthan")
		selected_filters += 'FILTER (?predicate1 < '+ filter_object +') ';
	else if (select_f == "lessthanorequal")
		selected_filters += 'FILTER (?predicate1 <= '+ filter_object +') ';
	else if (select_f == "greaterthan")
		selected_filters += 'FILTER (?predicate1 > '+ filter_object +') ';
	else if (select_f == "greaterthanorequal")
		selected_filters += 'FILTER (?predicate1 >= '+ filter_object +') ';
	else if (select_f == "equalto")
		selected_filters += 'FILTER (?predicate1 = '+ filter_object +') ';
	else if (select_f == "notequalto")
		selected_filters += 'FILTER (?predicate1 != '+ filter_object +') ';
	
	//Get the specified query
	var query = 'SELECT ?subject ?geom ?name ?purpose '+ predicate_objects +' (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' 
				+ selected_graphs +
		'WHERE { GRAPH ?g { ' + 
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + selected_predicates + 
		'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		' } ' +
		selected_filters +
		' } ' +
		'GROUP BY ?subject ?geom ?name ?purpose '+ predicate_objects +' ' ;
	
	if(document.getElementById(query_tab_id+'-qb-generated-query') == null)
	{
		var HTML = '<textarea cols="50" rows="20" id="'+ query_tab_id +'-qb-generated-query" style="resize:none; font-size: 12px; width: 100%">'+ query +'</textarea>'
					+ '<button type="button" id="' + query_tab_id + 'qb-run-query" onclick="getQueryField()">Run Query</button>'
					+ '<button type="button" id="' + query_tab_id + 'qb-clear-map" onclick="clearMap()">Clear Map</button>';

		//append the content to the query_tab
		query_tab.innerHTML += HTML;
	}
	else
	{
		document.getElementById(query_tab_id + '-qb-generated-query').value = query;
	}

	set_Select();
}

// Function to keep the old selection whether the query is successful or not
function set_Select(){
	// TODO: Make sure all selected_ are replaced with loops over all context, predicate, and filter selectors
	graph_context_values.forEach(function(item, index) {
		new_index = index + 1;
		if($('#' + query_tab_id + '-query-context-selector-' + new_index) != null)
			$('#' + query_tab_id + '-query-context-selector-' + new_index).val(item.value);
	});
	graph_predicate_values.forEach(function(item, index) {
		new_index = index + 1;
		if($('#' + query_tab_id + '-query-predicate-selector-' + new_index) != null)
			$('#' + query_tab_id + '-query-predicate-selector-' + new_index).val(item.value);
	});
	if( document.getElementById(query_tab_id + '-query-filter-selector') != null)
		document.getElementById(query_tab_id + '-query-filter-selector').selectedIndex = selected_f;
	if( document.getElementById(query_tab_id + '-query-filter-object') != null)
		document.getElementById(query_tab_id + '-query-filter-object').value = selected_comparison;
	
}

//Function to get the query from the query field and then run the universal query functon
function getQueryField(){
	makeUniversalQuery('Custom');
}

function checkUserQueryValidity(type_of_input) {
	// A function that checks the validy of different inputs from the user.

	// Check whether user submits an integer and is less than max graphs
	if(type_of_input == 'Graph Number') {
		const pattern = new RegExp('^[0-9]{1,2}$');  // Accepts 1 or 2 numbers
		let arr;
		let input_field = $('#' + query_tab_id + '-query-input-graph-number');
		let input_value = parseInt(input_field.val());  // Num of graphs

		if((arr = pattern.exec(input_value)) !== null) {
			if(arr[0] <= MAX_CUSTOM_GRAPHS && arr[0] > 0) {
				// If validy succeeds, change value of input box
				$('#' + query_tab_id + '-query-input-graph-number').attr('value', arr[0]);
				chooseQueryGraphs(arr[0]);  // Tell function to make x amt of graphs
			} else if(arr[0] > MAX_CUSTOM_GRAPHS) {
				alert(`Input is more than max graphs: ${arr[0]}/${MAX_CUSTOM_GRAPHS}.`);
				return;
			} else if(arr[0] <= 0) {
				alert('You need at least one graph in order to build a query.')
				return;
			}
		} else {
			console.log('Regex denied submission.');
			return;
		}
	}
}