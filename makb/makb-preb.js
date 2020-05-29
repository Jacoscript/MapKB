//Function to display the query as a tab
function createPreBuiltQueryTab(){
	var HTML = '';

	// Check whether max queries are already open
	if (current_custom_queries == MAX_CUSTOM_QUERIES) {
		// Still need to display the qb widget
		displayUpdatePreBWidget();
		return;
	} else {
		current_custom_queries += 1;
		query_tab_list.push(new QueryTab(current_custom_queries));
		query_tab_id = 'tabs-' + current_custom_queries;
		var id_sliced = query_tab_id.slice(5, 6) - 1;
		//createTab('Query Builder', HTML);
		createTab('Pre-Built Queries');

		// Ask whether user wants to use GeoSPARQL functions or regular SPARQL functions
		// HTML += '<div class="" id="' + query_tab_id +'-section-intro"><span class="qb-text-title" id="' + query_tab_id + '-qb-text-geo-or-not">Would you like to use GeoSPARQL or SPARQL?</span><br/>';
		// HTML += '<input id="' + query_tab_id + '-qb-radio-choose-sparql" name="sparql" type="radio" value="SPARQL"/> SPARQL <input id="' + query_tab_id + '-qb-radio-choose-geosparql" name="sparql" type="radio" value="GeoSPARQL"/> GeoSPARQL <br/>';
		// HTML += '<button class="qb-button" id="' + query_tab_id + '-qb-btn-get-user-sparql-option" type="button" onclick="determineSPARQLFunction();">Submit</button><hr/>';
		HTML += "<form onsubmit=\"getPreBQueryField()\"><label for=\"streetname\">Street Name: </label><input type=\"text\" id=\"streetname\" name=\"streetname\"><br>";
		HTML += "<label for=\"crossroadone\">First Cross Road: </label><input type=\"text\" id=\"crossroadone\" name=\"crossroadone\"><br>";
		HTML += "<label for=\"crossroadtwo\">Second Cross Road: </label><input type=\"text\" id=\"crossroadtwo\" name=\"crossroadtwo\"><br>";
		HTML += "<label for=\"buildingtype\">Building Type: </label><input type=\"text\" id=\"buildingtype\" name=\"buildingtype\"><br>";
		HTML += "<input type=\"submit\" value=\"Submit\"></form>";
		
		$('#' + query_tab_id).append(HTML);
	}
	// Display/Update the afd tab section after everything is created
	displayUpdatePreBWidget();
}


//Function to get the query from the query field and then run the universal query functon
function getPreBQueryField(){
	console.log("Got Here");
	crossRoads(document.getElementById('crossroadone').value,
	document.getElementById('crossroadtwo').value,
	document.getElementById('streetname').value,
	document.getElementById('buildingtype').value);
}