/* 
 * Map As A Knowledge Base functions for publications data retrieval
 */
	//Function to query to usgs publications rest interface
	function createPublicationsQuery(
        name, 
        lat,
        long,
        gml 
        ) {

		var HTML = '';

        //var query = name + "&lat=" + lat + "&long=" + long + "&r=100" ;
        wkt = encodeURIComponent(wkt);
        var query = name + "&g=" + wkt + "&relation=intersects"
		
		//HTTP encode the query
		//query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = PUBLICATIONS_REST_URL + query;
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
                        displayUpdatePubWidget();
                         return;
                    } else {
                        current_custom_queries += 1;
                        query_tab_list.push(new QueryTab(current_custom_queries));
                        query_tab_id = 'tabs-' + current_custom_queries;
                        var id_sliced = query_tab_id.slice(5, 6) - 1;
                        createTab('Publications');

                        bindings = result.records;
                        console.log(bindings);
                        //Check how many results there are. If 0 through an error. Otherwise, visualize them.
                        if(bindings.length > 0) {
                            //go through all of the results.
                            for(var i=0; i < bindings.length; i++) {
                                //declare the variables given the results.
                                title = bindings[i].title;

                                var tempString = (i + 1) +') ' + title +'<br>';
                                HTML = HTML + tempString;

                            }
                        
                        }
                        else { //There was no results so do nothing.
                            // 	// no_results_callback("No Dbpedia Entities Matching This One.");
                            }
                        // Display/Update the afd tab section after everything is created
                        $('#' + query_tab_id).append(HTML);
                        displayUpdatePubWidget();
                    }
                }
				
			}
		});
		
	}