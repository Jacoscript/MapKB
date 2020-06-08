/* 
 * Map As A Knowledge Base functions for dbpedia data retrieval
 */
	//Function to query to dbpedia SPARQL endpoint
		function createWikidataQuery(
			name, 
			lat, 
			lng  ) {
			// results_callback = function(result) { createTab('DBpedia', result) }, 
			// no_results_callback = function(msg) { alert(msg) }) {
			 var HTML = '';
			
			//Get the specified query
			// var query = 'SELECT * '+
			// 		'WHERE { ' +
			// 		'?s <http://wikiba.se/ontology#geoLatitude> ?lat . ' +
			// 		'?s <http://wikiba.se/ontology#geoLongitude> ?long . ' +
			// 		'?s ?p ?o ' +
			// 		'FILTER ((?lat >= '+lat+' - .01 && ?lat <= '+lat+' + .01) && (?long >= '+lng+' - .01 && ?long <= '+lng+' + .01))' +
			// 		'}' +
			// 		'LIMIT 1'; 

			var query = 'SELECT ?p ?o WHERE {?s p:P625 ?loc; ' +
							'?p ?o; ' +
						 	'p:P30 ?continent; ' +
							'p:P17 ?country . ' +
						'?loc psv:P625 ?geom . ' +
						'?geom <http://wikiba.se/ontology#geoLatitude> ?lat; ' +
							'<http://wikiba.se/ontology#geoLongitude> ?long . ' +
						'?continent ps:P30 wd:Q49. ' +
						'?country ps:P17 wd:Q30 . ' +
						'FILTER ((?lat >= '+lat+'- .001 && ?lat <='+lat+'+ .001) && (?long >= '+lng+' - .001 && ?long <= '+lng+' + .001)) ' +
						'SERVICE wikibase:label {bd:serviceParam wikibase:language "en" . } ' +
					   	'}';

			console.log(query);
			
			//HTTP encode the query
			query = encodeURIComponent(query);
			//Create the URL for the HTTP request
			var httpGet = WIKIDATA_SPARQL_URL  + query;
			console.log(query);
			// execute sparql query in the dbpedia sparql endpoint
			$.get({url: httpGet, 
				success: function(result) {
					//If there are no results say so. Otherwise, visualize them.
					if(!result) {
						// no_results_callback('No results!');
					}
					else {
	
	
						// Check whether max queries are already open
						if (current_custom_queries == MAX_CUSTOM_QUERIES) {
							// Still need to display the qb widget
							displayUpdateWikiWidget();
							 return;
						} else {
							current_custom_queries += 1;
							query_tab_list.push(new QueryTab(current_custom_queries));
							query_tab_id = 'tabs-' + current_custom_queries;
							var id_sliced = query_tab_id.slice(5, 6) - 1;
							//createTab('Query Builder', HTML);
							createTab('Wikidata');
	
							console.log(result);
							bindings = result.results.bindings;
							console.log(bindings);
							//Check how many results there are. If 0 through an error. Otherwise, visualize them.
							if(bindings.length > 0) {
								//go through all of the results.
								for(var i=0; i < bindings.length; i++) {
									//declare the variables given the results.
									pvalue = bindings[i].p.value;
									ovalue = bindings[i].o.value;

									var tempString = pvalue+': '+ovalue+'<br>';
									HTML = HTML + tempString;

								}	
								
								
							}
							else { //There was no results so do nothing.
								// 	// no_results_callback("No Dbpedia Entities Matching This One.");
							}
							// Display/Update the afd tab section after everything is created
							console.log(HTML);
							$('#' + query_tab_id).append(HTML);
							
							displayUpdateWikiWidget();
						}
					}
					
				}
			});
			
		}