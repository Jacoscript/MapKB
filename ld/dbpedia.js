/* 
 * Map As A Knowledge Base functions for dbpedia data retrieval
 */
	//Function to query to dbpedia SPARQL endpoint
	
	function createDBpediaQuery(
		name, 
		lat, 
		lng, 
		results_callback = function(result) { createTab('DBpedia', result) }, 
		no_results_callback = function(msg) { alert(msg) }) {
		var HTML = '';
		
		//Get the specified query
		var query = 'SELECT * '+
					'WHERE { ' +
					'?s foaf:name ?name . ' +
					'?s geo:lat ?lat . ' +
					'?s geo:long ?long . ' +
					'?s ?p ?o ' +
					'FILTER (regex(?name, \''+name+'\') && (?lat >= '+lat+' - .001 && ?lat <= '+lat+' + .001) && (?long >= '+lng+' - .001 && ?long <= '+lng+' + .001))' +
					'}' +
					'LIMIT 100'; 
		console.log(query);
		
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = DBPEDIA_SPARQL_URL + query;
		
		// execute sparql query in the dbpedia sparql endpoint
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					no_results_callback('No results!');
				}
				else {
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
						
						results_callback(HTML);
						//createTab('DBpedia', HTML);
					}
					else { //There was no results so do nothing.
						no_results_callback("No Dbpedia Entities Matching This One.");
					}
				}
			}
		});
		
	}