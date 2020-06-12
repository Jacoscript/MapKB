/* 
 * Map As A Knowledge Base functions for dbpedia data retrieval
 */
	//Function to query to dbpedia SPARQL endpoint

	function createDBpediaQuery(
		name, 
		lat, 
		lng  ) {
		 var HTML = '';
		
		//Get the specified query
		var query = 'SELECT * '+
					'WHERE { ' +
					'?s <http://www.w3.org/2000/01/rdf-schema#label> ?label . ' +
					'?s geo:lat ?lat . ' +
					'?s geo:long ?long . ' +
					'?s ?p ?o ' +
					'FILTER ( (regex(?label, \''+name+'\') && (?lat >= '+lat+' - .001 && ?lat <= '+lat+' + .001) && (?long >= '+lng+' - .001 && ?long <= '+lng+' + .001)) ' +
					'|| ((?lat >= '+lat+' - .001 && ?lat <= '+lat+' + .001) && (?long >= '+lng+' - .001 && ?long <= '+lng+' + .001)))' +
					'}'; //+
					//'LIMIT 100'; 
		
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = DBPEDIA_SPARQL_URL + query;
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
                        displayUpdateDBPBWidget();
                         return;
                    } else {
                        current_custom_queries += 1;
                        query_tab_list.push(new QueryTab(current_custom_queries));
                        query_tab_id = 'tabs-' + current_custom_queries;
                        var id_sliced = query_tab_id.slice(5, 6) - 1;
                        //createTab('Query Builder', HTML);
                        createTab('DBPedia');

                        bindings = result.results.bindings;
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
                        $('#' + query_tab_id).append(HTML);
                        displayUpdateDBPWidget();
                    }
                }
				
			}
		});
		
	}