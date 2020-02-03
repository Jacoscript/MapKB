// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for custom query builder operations.

const MAX_CUSTOM_QUERIES = 3;
const MAX_CUSTOM_GRAPHS = 10;
var current_custom_graphs = 0;
var current_custom_queries = 0;
var selected_c = 0;
var selected_p = 0;
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
			var HTML = '<p style="font-size:15px; margin: 0px;">How many graphs would you like:</p>'
					   + '<input id="' + query_tab_id + '-query-input-graph-number" title="Number between 1-10" type="text"/><br/>'
					   + '<button type="button" onclick="checkUserQueryValidity(\'Graph Number\');">Submit</button>'
			createTab('Query Builder', HTML);
		}
	}

	//Function to return the specific graphs the user wants to use
	function chooseQueryGraphs(number_of_graphs) {
		// TODO: Use number_of_graphs to create the user specified number of graph lookups

		// TODO: Check if graph count has been changed.
		// TODO: ^ If so, we need to make sure html doesn't repeat on reselection of graphs
		if(current_custom_graphs == number_of_graphs) {
			// Don't need to change the html
			return;
		} else {
			// TODO: Make sure html is changed to have specified number_of_graphs but also
			// TODO: ^ make sure it isn't added on
		}
		var query_tab = document.getElementById(query_tab_id);
		var HTML = '<p style="font-size:15px">Choose what graphs you would like to query: <br></p>'
				   + '<select style="font-size:10px; width: 100%;" id="'+ query_tab_id +'-query-context-selector">'; 
			
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
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							context = bindings[i].g.value;
							//only include relevant contexts.
							if(context.includes("http://localhost:8080/marmotta/context/"))
							{
								var temp_string = '<option value="'+context+'">'+ context +'</option>';
								HTML = HTML + temp_string;
							}
						}
						HTML = HTML + '</select><br><br>'
									+ '<button type="button" onclick="findQueryPredicates();">Find Predicates</button> ';
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
		//var values = $('#query-context-selector').val();
		var context = document.getElementById(query_tab_id + '-query-context-selector');
		var value = context.options[context.selectedIndex].value;
		selected_c = context.selectedIndex;
		
		var HTML = '';
		
		if(document.getElementById(query_tab_id + '-query-predicate-selector') == null) {
			HTML = '<p style="font-size:15px">Choose what predicates you would like to filter the selected graphs by: <br></p>'
				   + '<select style="font-size:10px" id="'+ query_tab_id +'-query-predicate-selector">'; 
		}
		else 
		{
			for(var i = 0; i < document.getElementById(query_tab_id+'-query-predicate-selector').length; i++)
				document.getElementById(query_tab_id+'-query-predicate-selector').remove(i);
		}
		var selected_graphs = "";
		//for(var i = 0; i<values.length; i++)
		//{
			//selected_graphs+= 'FROM NAMED <'+values[i]+'> ';
		//}
		
		selected_graphs+= 'FROM NAMED <'+ value +'> ';
		
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
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							context = bindings[i].p.value;
							
							var temp_string = '<option value="'+ context +'">'+ context +'</option>';
							HTML = HTML + temp_string;
						}
						if( document.getElementById(query_tab_id + '-query-predicate-selector') == null) {
							HTML = HTML + '</select><br><br>'
										+ '<button type="button" onclick="findQueryFilters();">Find Filter Options</button> ';
							
							//append the content to the query_tab
							query_tab.innerHTML += HTML;
						}
						else
						{
							document.getElementById(query_tab_id + '-query-predicate-selector').innerHTML=HTML;
						}
						
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
		var predicates = document.getElementById(query_tab_id + '-query-predicate-selector');
		var selected = predicates.options[predicates.selectedIndex].value;
		selected_p = predicates.selectedIndex;
		
		if(document.getElementById(query_tab_id + '-query-filter-selector') == null) {
			var HTML = '<p style="font-size:15px">Choose how you want to filter the predicates: <br></p>'
					   + '<select style="font-size:10px" id="'+ query_tab_id +'-query-filter-selector">';
		
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
			
		HTML = HTML + '</select><br>'
		+ '<p style="font-size:15px";>What do you want to compare the objects to? <br></p>'
		+ '<textarea cols="50" rows="1" id="'+ query_tab_id +'-query-filter-object" style="resize:none; font-size: 12px; width: 100%;"></textarea><br><br>'
		+ '<button type="button" onclick="generateQuery();">Generate Query</button> <br> ';
						
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
		//var contexts = $('#query-context-selector').val();
		var context = document.getElementById(query_tab_id + '-query-context-selector');
		var select_c = context.options[context.selectedIndex].value;
		
		var predicates = document.getElementById(query_tab_id + '-query-predicate-selector');
		var select_p = predicates.options[predicates.selectedIndex].value;
		
		var filters = document.getElementById(query_tab_id + '-query-filter-selector');
		var select_f = filters.options[filters.selectedIndex].value;
		
		var filter_object = document.getElementById(query_tab_id + '-query-filter-object').value;
		
		selected_f = filters.selectedIndex;
		selected_comparison = filter_object;
		
		//Generate the selected graphs
		var selected_graphs = '';
		//for(var i = 0; i<contexts.length; i++)
		//{
			//selected_graphs+= 'FROM NAMED <'+contexts[i]+'> ';
		//}
		
		selected_graphs+= 'FROM NAMED <'+ select_c +'> ';
		
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
		if(select_p.includes("geosparql"))
		{
			predicate_objects+= '?predicate1 ';
			selected_predicates+= '?geom <'+ select_p +'> ?predicate1 . ';
		}
		else
		{
			predicate_objects+= '?predicate1 ';
			selected_predicates+= '?subject <'+ select_p +'> ?predicate1 . ';
		}
		
		if(select_f == "regex")
			selected_filters+= 'FILTER regex(?predicate1 , "'+ filter_object +'")  ';
		else if (select_f == "lessthan")
			selected_filters+= 'FILTER (?predicate1 < '+ filter_object +') ';
		else if (select_f == "lessthanorequal")
			selected_filters+= 'FILTER (?predicate1 <= '+ filter_object +') ';
		else if (select_f == "greaterthan")
			selected_filters+= 'FILTER (?predicate1 > '+ filter_object +') ';
		else if (select_f == "greaterthanorequal")
			selected_filters+= 'FILTER (?predicate1 >= '+ filter_object +') ';
		else if (select_f == "equalto")
			selected_filters+= 'FILTER (?predicate1 = '+ filter_object +') ';
		else if (select_f == "notequalto")
			selected_filters+= 'FILTER (?predicate1 != '+ filter_object +') ';
		
		/*for(var j = 0; j<filters.length; j++)
			{
				if(filters[j]=="regex")
				{
					selected_filters+= 'regex(?predicate1 , "'+ filter_object +'") }';
				}
			}
		*/
		
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
		
		if( document.getElementById(query_tab_id+'-qb-generated-query') == null)
		{
			var HTML = '<br><textarea cols="50" rows="20" id="'+ query_tab_id +'-qb-generated-query" style="resize:none; font-size: 12px; width: 100%">'+ query +'</textarea><br><br>'
			+ '<button type="button" id="qb-run-query" onclick="getQueryField()">Run Query</button>'
			+ '<button type="button" id="qb-clear-map" onclick="clearMap()">Clear Map</button>';

			//append the content to the query_tab
			query_tab.innerHTML += HTML;
		}
		else
		{
			document.getElementById(query_tab_id + '-qb-generated-query').value = query;
		}

		set_Select();
	}
	
	//Function to reset the selected after every button press.
	function set_Select(){
		
		if( document.getElementById(query_tab_id + '-query-context-selector') != null)
			document.getElementById(query_tab_id + '-query-context-selector').selectedIndex = selected_c;
		if( document.getElementById(query_tab_id + '-query-predicate-selector') != null)
			document.getElementById(query_tab_id + '-query-predicate-selector').selectedIndex = selected_p;
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
		// A function that checks the validy of different inputs from the user

		if(type_of_input == 'Graph Number') {
			const pattern = new RegExp('^[0-9]{1,2}$');  // Accepts 1 or 2 numbers
			let arr;
			let input_field = $('#' + query_tab_id + '-query-input-graph-number');
			let input_value = input_field.val();

			if((arr = pattern.exec(input_value)) !== null) {
				if(arr[0] <= MAX_CUSTOM_GRAPHS) {
					// If validy succeeds
					current_custom_graphs = parseInt(arr[0]);
					chooseQueryGraphs(arr[0]);
				} else {
					alert(`Input is more than max graphs: ${arr[0]}/${MAX_CUSTOM_GRAPHS}.`);
					return;
				}
			} else {
				console.log('Regex denied submission.');
				return;
			}
		}
	}
	
