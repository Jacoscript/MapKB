/* 
 * Map As A Knowledge Base functions for custom query builder operations
 */

var current_custom_queries = 0;
var selected_c = 0;
var selected_p = 0;
var selected_f = 0;
var selected_comparison = '';
var max_custom_queries = 3;

	//Function to display the query as a tab
	function createQueryTab(){
		// Check whether query is already open
		if (current_custom_queries == max_custom_queries) {
			return;
		} else {
			current_custom_queries += 1;
			var HTML = '<p style="font-size:15px">Choose what graphs you would like to query: <br></p>' +
						'<select style="font-size:10px; width: 100%;" id="queryContextSelector">'; 
			
			
			//Get the specified query
			var query = 'SELECT DISTINCT ?g '+
						'WHERE { ' +
						'GRAPH ?g { ?s ?p ?o } ' +
						'}' ; 
			
			//HTTP encode the query
			query = encodeURIComponent(query);
			//Create the URL for the HTTP request
			var httpGet = MARMOTTA_SPARQL_URL + query;
			
			// execute sparql query in marmotta
			$.get({url: httpGet, 
				success: function(result) {
					//If there are no results say so. Otherwise, visualize them.
					if(!result) {
						notification_manager.addToNotificationQueue("Warning", "No results.");
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
									var tempString = '<option value="'+context+'">'+context+'</option>';
									HTML = HTML + tempString;
								}
							}
							HTML = HTML + '</select><br><br>'
										+ '<button type="button" onclick="findQueryPredicates();">Find Predicates</button> ';
							createTab('Query Builder', HTML);
						}
						else { //There was no results so do nothing.
							notification_manager.addToNotificationQueue("Error", "No results for bindings while creating query tab.");
						}
					}
				}
			});
		}
	}
	
	//Function to return the predicates for the given context
	function findQueryPredicates(){
		
		var queryTab = document.getElementById(queryTabID);
		//var values = $('#queryContextSelector').val();
		var context = document.getElementById('queryContextSelector');
		var value = context.options[context.selectedIndex].value;
		selected_c = context.selectedIndex;
		
		var HTML = '';
		
		if( document.getElementById("queryPredicateSelector") == null) {
			HTML = '<p style="font-size:15px">Choose what predicates you would like to filter the selected graphs by: <br></p>' +
						'<select style="font-size:10px" id="queryPredicateSelector">'; 
		}
		else 
		{
			for(var i = 0; i < document.getElementById("queryPredicateSelector").length; i++)
				document.getElementById("queryPredicateSelector").remove(i);
		}
		
		var selectedGraphs = "";
		//for(var i = 0; i<values.length; i++)
		//{
			//selectedGraphs+= 'FROM NAMED <'+values[i]+'> ';
		//}
		
		selectedGraphs+= 'FROM NAMED <'+value+'> ';
		
		//Get the specified query
		var query = 'SELECT DISTINCT ?p '+ selectedGraphs +
					'WHERE { ' +
					'GRAPH ?g { ?s ?p ?o } ' +
					'}' ; 
		
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while finding query predicates.");
				}
				else {
					bindings = result.results.bindings;
					//Check how many results there are. If 0 through an error. Otherwise, visualize them.
					if(bindings.length > 0) {
						//go through all of the results.
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							context = bindings[i].p.value;
							
							var tempString = '<option value="'+context+'">'+context+'</option>';
							HTML = HTML + tempString;
						}
						if( document.getElementById("queryPredicateSelector") == null) {
							HTML = HTML + '</select><br><br>'
										+ '<button type="button" onclick="findQueryFilters();">Find Filter Options</button> ';
							
							//append the content to the queryTab
							queryTab.innerHTML += HTML;
						}
						else
						{
							document.getElementById("queryPredicateSelector").innerHTML=HTML;
						}
						
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Error", "No results for bindings while finding query predicates.");
					}
				}
				//Whether we are successful or not, we should keep the same options selected
				set_Select();
			}
		});
		
		
	}
	
	//Function to gets filters for the given predicate
	function findQueryFilters(){
		
		var queryTab = document.getElementById(queryTabID);
		var predicates = document.getElementById('queryPredicateSelector');
		var selected = predicates.options[predicates.selectedIndex].value;
		selected_p = predicates.selectedIndex;
		
		if(document.getElementById("queryFilterSelector") == null) {
			var HTML = '<p style="font-size:15px">Choose how you want to filter the predicates: <br></p>' +
						'<select style="font-size:10px" id="queryFilterSelector">'; 
		
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
		+ '<textarea cols="50" rows="1" id="queryFilterObject" style="resize:none; font-size: 12px; width: 100%;"></textarea><br><br>'
		+ '<button type="button" onclick="generateQuery();">Generate Query</button> <br> ';
						
		//append the content to the queryTab
		queryTab.innerHTML += HTML;
		}
		else 
		{
			//we will update the select once this becomes dynamic.
		}
		set_Select();
					
	}
	
	//This function generates the sparql query and shows it in the sparql textarea.
	function generateQuery(){
		
		var queryTab = document.getElementById(queryTabID);
		//var contexts = $('#queryContextSelector').val();
		var context = document.getElementById('queryContextSelector');
		var select_c = context.options[context.selectedIndex].value;
		
		var predicates = document.getElementById('queryPredicateSelector');
		var select_p = predicates.options[predicates.selectedIndex].value;
		
		var filters = document.getElementById('queryFilterSelector');
		var select_f = filters.options[filters.selectedIndex].value;
		
		var filterObject = document.getElementById('queryFilterObject').value;
		
		selected_f = filters.selectedIndex;
		selected_comparison = filterObject;
		
		//Generate the selected graphs
		var selectedGraphs = '';
		//for(var i = 0; i<contexts.length; i++)
		//{
			//selectedGraphs+= 'FROM NAMED <'+contexts[i]+'> ';
		//}
		
		selectedGraphs+= 'FROM NAMED <'+select_c+'> ';
		
		//Generate the predicate and filter statements
		var selectedPredicates = '';
		var predicateObjects = '';
		var selectedFilters = '';
		//for(var i = 0; i<predicates.length; i++)
		//{	
			//predicateObjects+= '?predicate'+i+' ';
			//selectedPredicates+= '?subject <'+predicates[i]+'> ?predicate'+i+' ';
			
		//}
		
		//We must check if the predicate belongs to the geometry or the feature.
		//We change the subject of the the triple accordingly.
		if(select_p.includes("geosparql"))
		{
			predicateObjects+= '?predicate1 ';
			selectedPredicates+= '?geom <'+select_p+'> ?predicate1 . ';
		}
		else
		{
			predicateObjects+= '?predicate1 ';
			selectedPredicates+= '?subject <'+select_p+'> ?predicate1 . ';
		}
		
		if(select_f == "regex")
			selectedFilters+= 'FILTER regex(?predicate1 , "'+filterObject+'")  ';
		else if (select_f == "lessthan")
			selectedFilters+= 'FILTER (?predicate1 < '+filterObject+') ';
		else if (select_f == "lessthanorequal")
			selectedFilters+= 'FILTER (?predicate1 <= '+filterObject+') ';
		else if (select_f == "greaterthan")
			selectedFilters+= 'FILTER (?predicate1 > '+filterObject+') ';
		else if (select_f == "greaterthanorequal")
			selectedFilters+= 'FILTER (?predicate1 >= '+filterObject+') ';
		else if (select_f == "equalto")
			selectedFilters+= 'FILTER (?predicate1 = '+filterObject+') ';
		else if (select_f == "notequalto")
			selectedFilters+= 'FILTER (?predicate1 != '+filterObject+') ';
		
		/*for(var j = 0; j<filters.length; j++)
			{
				if(filters[j]=="regex")
				{
					selectedFilters+= 'regex(?predicate1 , "'+filterObject+'") }';
				}
			}
		*/
		
		//Get the specified query
		var query = 'SELECT ?subject ?geom ?name ?purpose '+predicateObjects+' (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
			selectedGraphs +
			'WHERE { GRAPH ?g { ' + 
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + selectedPredicates + 
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			' } ' +
			selectedFilters +
			' } ' +
			'GROUP BY ?subject ?geom ?name ?purpose '+predicateObjects+' ' ;
		
		if( document.getElementById("generatedQuery") == null)
		{
			var HTML = '<br><textarea cols="50" rows="20" id="generatedQuery" style="resize:none; font-size: 12px; width: 100%">'+query+'</textarea><br><br>'
			+ '<button type="button" id="runQuery" onclick="getQueryField();">Run Query</button> ';

			//append the content to the queryTab
			queryTab.innerHTML += HTML;
		}
		else
		{
			document.getElementById("generatedQuery").value = query;
		}
		
		
		
		//document.getElementById("runQuery").setAttribute("onclick", "javascript: makeUniversalQuery(\'"+query+"\');" );
		
		set_Select();
	}
	
	//Function to reset the selected after every button press.
	function set_Select(){
		
		if( document.getElementById("queryContextSelector") != null)
			document.getElementById("queryContextSelector").selectedIndex = selected_c;
		if( document.getElementById("queryPredicateSelector") != null)
			document.getElementById("queryPredicateSelector").selectedIndex = selected_p;
		if( document.getElementById("queryFilterSelector") != null)
			document.getElementById("queryFilterSelector").selectedIndex = selected_f;
		if( document.getElementById("queryFilterObject") != null)
			document.getElementById("queryFilterObject").value = selected_comparison
		
	}
	
	//Function to get the query from the query field and then run the universal query functon
	function getQueryField(){
		
		var query = document.getElementById('generatedQuery').value;
		makeUniversalQuery(query);
		
	}
	
	
