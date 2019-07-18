/* 
 * Map As A Knowledge Base functions for RDF processing operations
 */

var MARMOTTA_BASE_URL = 'http://144.47.161.52:8080/marmotta';
var MARMOTTA_DEREF_URL = MARMOTTA_BASE_URL + '/meta/application/ld+json?uri=';
var MARMOTTA_SPARQL_URL = MARMOTTA_BASE_URL + '/sparql/select?output=json&query=';
var FEATURE_BASE_URL = 'http://data.usgs.gov/';

// load the namespace IDs json from URL
var nsids = {};
$.getJSON('./afd/afd-nsids.json', function(data) { nsids = data; });

//Function to make a point query and visualize the results.
	function makePointQuery(inputQuery){
		//Clear the current map layer
		clearMap();
		//Get the specified query
		var query = getQuery(inputQuery);
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//Check how many results there are. If 0 through an error. Otherwise, visualize them.
					if(bindings.length > 0) {
						//go through all of the results.
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							featureToolTip = "Unknown";
							name = bindings[i].name.value;
							uri = bindings[i].subject.value;
							purpose = bindings[i].purpose.value;
							geometry = bindings[i].geometry.value;
							//specify the icon depending on the feature type.
							var smallIcon = L.icon({
								iconSize: [27, 27],
								iconAnchor: [13, 27],
								popupAnchor:  [0, -30],
                                tooltipAnchor: [0, -25],
								iconUrl: 'leaflet/icons/' + getSymbol(purpose) + '.png'
							});
							featureToolTip = purpose;
							//get the type name from the URI of the feature
							var ftypeName = uri.split("/");
							var latlngs = new Array();
							latlngs = makeLatLngs(geometry);
							//Create a marker with a popup
							circlePoint = new L.marker(latlngs, {icon: smallIcon}).bindTooltip(featureToolTip, {direction:'top'});
							circlePoint.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+uri+"');\">Additional Information</a><br>" +
									"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a></p>"
									);
							//add the new marker for the given entity to the mapping layer.
							grouping.addLayer(circlePoint);
						}
						//visualize the mapping layer when all the markers have been added.
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
				}
			}
		});
	}
	//Function to make a line query and visualize the results.
	function makeLineQuery(inputQuery){
		//clear the map
		clearMap();
		//get the query and encode it.
		var query = getQuery(inputQuery);
		query = encodeURIComponent(query);
		//get the http requuest URL
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
						//go through all fo the results
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results
							geometry = bindings[i].geometry.value;
							subject = bindings[i].subject.value;
							dimensions = bindings[i].dimensions.value;
							//Check if there is a name. Otherwise name will be "Unknown"
							name = "Unknown";
							if(bindings[i].name != undefined)
							{
								name = bindings[i].name.value;
							}
							//Check if there is a purpose. Otherwise purpose will be "Unknown"
							purpose = "Unknown";
							if(bindings[i].purpose != undefined)
							{
								purpose = bindings[i].purpose.value;
							}
							//Create a latlng array to store all fo the coordinates
							var latlngs = new Array();
							latlngs = makeLatLngs(geometry);
							//create a new polyline object with the given popup
							polyLine = new L.polyline(latlngs,{color: '#228B22'});
							polyLine.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polyLine);
						}
						//visualize the mapping layer
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
				}
			}
		});
	}
	//Function to make a line query and visualize the results.
	function makePolygonQuery(inputQuery){
		//clear the map
		clearMap();
		//get the query and encode it.
		var query = getQuery(inputQuery);
		query = encodeURIComponent(query);
		//get the http requuest URL
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
						
						//go through all fo the results
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results
							geometry = bindings[i].geometry.value;
							subject = bindings[i].subject.value;
							dimensions = bindings[i].dimensions.value;
							//Check if there is a name. Otherwise name will be "Unknown"
							name = "Unknown";
							if(bindings[i].name != undefined)
							{
								name = bindings[i].name.value;
							}
							//Check if there is a purpose. Otherwise purpose will be "Unknown"
							purpose = "Unknown";
							if(bindings[i].purpose != undefined)
							{
								purpose = bindings[i].purpose.value;
							}
							var latlngs = new Array();
							latlngs = makeLatLngs(geometry);
							//create a new polyline object with the given popup
							polygon = new L.polygon(latlngs,{color: '#000000'});
							polygon.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polygon);
						}
						//visualize the mapping layer
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
				}
			}
		});
	}
	//Function to make a line query and visualize the results.
	function makeSplitPolygonQuery(inputQuery){
		//clear the map
		clearMap();
		//get the query and encode it.
		var query = getQuery(inputQuery);
		query = encodeURIComponent(query);
		//get the http requuest URL
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
						
						//go through all fo the results
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results
							geometry1 = bindings[i].geometry1.value;
							geometry2 = bindings[i].geometry2.value;
							subject = bindings[i].subject.value;
							dimensions = bindings[i].dimensions.value;
							//Check if there is a name. Otherwise name will be "Unknown"
							name = "Unknown";
							if(bindings[i].name != undefined)
							{
								name = bindings[i].name.value;
							}
							//Check if there is a purpose. Otherwise purpose will be "Unknown"
							purpose = "Unknown";
							if(bindings[i].purpose != undefined)
							{
								purpose = bindings[i].purpose.value;
							}
							//Create a latlng array to store all fo the coordinates
							var latlngs = new Array();
							latlngs = makeLatLngs(geometry1,geometry2);
							//create a new polyline object with the given popup
							polygon = new L.polygon(latlngs,{color: '#000000'});
							polygon.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polygon);
						}
						//visualize the mapping layer
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
				}
			}
		});
	}
	//Function to get additional information for a given entity
	function additionalInformation(URI)
	{
		// first clear tabs/data from previous features displayed
		$('#afd-tabs ul li').remove();
		$('#afd-tabs div').remove();
		$("#afd-tabs").tabs("refresh");
		//Get the query and encode it
		var query = getQuery("moreInfo",URI);
		query = encodeURIComponent(query);
		//Get the http request url.
		var httpGet = MARMOTTA_SPARQL_URL + query;
		//create an object to store the HTML for the additional information tab and declare the first line
		var HTML = "<b>Universal Resource Identifier: &nbsp; </b> "+URI+"<br>";
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert('No results!');
				}
				else {
				bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
						//go through all of the results and add them to the tab.
						for(var i=0; i < bindings.length; i++) {
							HTML+=
							"<b>" + bindings[i].property.value + ": &nbsp; </b> <a href='#' onClick=\"IRISearch('"+bindings[i].property.value+"','"+ bindings[i].object.value + "');\">" + bindings[i].object.value + "</a><br>";
						}
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
					//Create the tab for the additional information.
					createTab('Additional Information', HTML);
				}
			}
		});
	}
	//Function to return a query based on the input information
	function getQuery(queryType, URI)
	{
		var query;
		switch(queryType){
		case "GNIS":
			query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ' +
			'FROM <http://localhost:8080/marmotta/context/GNIS> ' +
			'WHERE { ' +
			'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
			'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'} ';
		break;
		case "Geonames":
		query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ' +
			'FROM <http://localhost:8080/marmotta/context/Geonames> ' +
			'WHERE { ' +
			'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
			'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'} ';
		break;
		case "Structures":
		query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ' +
			'FROM <http://localhost:8080/marmotta/context/Structures> ' +
			'WHERE { ' +
			'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
			'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'} ';
		break;
		case "Trails":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
		'WHERE { GRAPH ?g { ' +
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
		'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
		'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
		case "County":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
		'WHERE { GRAPH ?g { ' +
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
		'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
		'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
		case "State":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry1 ?geometry2 ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
		'WHERE { GRAPH ?g { ' +
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
		'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
		'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry1 . '+
		'?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 ' +
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
		case "PADUS":
		query = 'SELECT ?subject ?gm ?purpose ?name '+
		'(GROUP_CONCAT(DISTINCT ?geometry; SEPARATOR="; ") AS ?c) '+
		'FROM NAMED <http://localhost:8080/marmotta/context/PADUS> '+
		'WHERE { GRAPH ?g { '+
		'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?gm . '+
		'?gm <http://www.opengis.net/ont/geosparql#asGML> ?geometry . '+
		'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } '+
		'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } '+
		'}} '+
		'GROUP BY ?subject ?gm ?purpose ?name ';
		break;
		case "Custom":
			query = document.getElementById('queryText').value;
			break;
		case "moreInfo":
			query = 'SELECT * FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/PADUS> ' +
			'WHERE { GRAPH ?g {<' + URI + '> ?property ?object }}';
			break;
		default:
			alert("Error, No Query Selected");
		}
		return query;
	}
	//Function to perform an IRI search for a user
	function IRISearch(property, object){
		//clear the map
		clearMap();
		//initalize some variables used to make the query
		var queryFields = '';
		var queryData = '';
		var filterProperty ='';
		//If the given property is already in the query, do not add additional information to the query.
		if (property == "<http://dbpedia.org/ontology/purpose>")
		{
			filterProperty = '?purpose';
		}
		else if (property == "<http://data.usgs.gov/ontology/structures/hasOfficialName>")
		{
			filterProperty = '?name';
		}
		//If the given property is NOT already in the query, the request additional information in the query.
		else
		{
			queryData = '?tester';
			queryFields = '?subject <'+property+'> ?tester . ';
			filterProperty = '?tester';
		} 
		//Check if the user is looking up a URI. Otherwise, perform a query finding additional entities that have the same data for that field.
		if(property != "http://www.opengis.net/ont/geosparql#hasGeometry" && property != "http://data.usgs.gov/ontology/structures/hasState" && property != "http://dbpedia.org/ontology/county" && property != "http://dbpedia.org/ontology/state")
		{
			/*var query = 'SELECT ?subject ?geom ?geometry ?name ?purpose ?geometry2'+queryData+' FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'WHERE { GRAPH ?g { ' + 
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + queryFields + 
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			'OPTIONAL { ?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 } ' +
			' } ' +
			'FILTER regex( '+filterProperty+' , "'+object+'")  }';*/
			
			var query = 'SELECT ?subject ?geom ?name ?purpose ?geometry2 '+queryData+' (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/PADUS> ' +
			'WHERE { GRAPH ?g { ' + 
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + queryFields + 
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			'OPTIONAL { ?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 . } ' +
			' } ' +
			'FILTER regex( '+filterProperty+' , "'+object+'")  } ' +
			'GROUP BY ?subject ?geom ?name ?purpose ?geometry2 '+queryData+' ' ;
		}
		else if(property == "http://www.opengis.net/ont/geosparql#hasGeometry")
		{
			/*var query = 'SELECT  ?subject ?geometry2 (GROUP_CONCAT(DISTINCT ?g; SEPARATOR="; ") AS ?geometry) ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/PADUS> ' +
			'WHERE { GRAPH ?g { ' + 
			'<'+object+'> <http://www.opengis.net/ont/geosparql#asGML> ?g . ' +
			'OPTIONAL { <'+object+'> <http://dbpedia.org/ontology/coordinates> ?geometry2 } ' +
			' } ' +
			'FILTER regex( ?subject , "'+object+'")  } ' + ' +
			'GROUP BY <'+object+'> ';*/
			
			var query = 'SELECT  ?subject ?geometry2 (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/PADUS> ' +
			'WHERE { GRAPH ?g { ' +
			//'BIND ( <'+object+'> AS ?subject ) ' +
			'?subject <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/coordinates> ?geometry2 . } ' +
			' } ' +
			'FILTER regex( ?subject , "'+object+'")  } ' + 
			'GROUP BY ?subject ?geometry2';
		}
		else if(property == "http://data.usgs.gov/ontology/structures/hasState" || property == "http://dbpedia.org/ontology/state")
		{
			var query = 'SELECT ?geometry ?geometry2 ?dimensions ?purpose ?name FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'WHERE { GRAPH ?g { ' + 
			'<'+object+'> <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . '+
			'?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 ' +
			'OPTIONAL { <'+object+'> <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { <'+object+'> <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			' } ' +
			' }';
		}
		else if(property == "http://dbpedia.org/ontology/county")
		{
			var query = 'SELECT ?geometry ?geometry2 ?dimensions ?purpose ?name FROM NAMED <http://localhost:8080/marmotta/context/GNIS> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/Trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/CountyOrEquivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/StateOrTerritory> ' +
			'WHERE { GRAPH ?g { ' + 
			'<'+object+'> <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . '+
			'OPTIONAL { ?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 . }' +
			'OPTIONAL { <'+object+'> <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { <'+object+'> <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			' } ' +
			' }';
		}
		//Encode the query.
		query = encodeURIComponent(query);
		//Get the URL for the http query request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If no results then throw an error
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//If there are 0 records in the results then throw an error
					if(bindings.length > 0) {
						//Go through all of the results
						for(var i=0; i < bindings.length; i++) {
							//Check if there is a subject attach. If there isn't, then this is a geometry request.
							uri = object;
							geometry = bindings[i].geometry.value;
							//geometry = bindings[i].c.value;
							//THIS SHOULD BE REMOVED WHEN ALL GEOMETRIES ARE STORED THE SAME
							geometry2=null;
							if(bindings[i].geometry2 != undefined)
								geometry2 = bindings[i].geometry2.value
							if(bindings[i].subject != undefined)
								uri = bindings[i].subject.value;
							//If there is no name, set to Unknown
							name = "Unknown";
							if(bindings[i].name != undefined)
								name = bindings[i].name.value;
							//If there is no purpose, set to Unknown
							purpose = "Unknown";
							if(bindings[i].purpose != undefined)
								purpose = bindings[i].purpose.value;
							//get the type name via the uri
							var ftypeName = uri.split("/");
							//create an object to store the latlng if the entity is a line.
							var latlngs = new Array();
							
							
							/*
							if(bindings[i].geometry2 == undefined)
							{
								latlngs = makeLatLngs(geometry); 
							}
							else 
							{
								latlngs = makeLatLngs(geometry,bindings[i].geometry2.value);
							}*/
							
							//get the coordinate information from the results
							//Create the icon for the results if it is a point
							var smallIcon = L.icon({
								  iconSize: [27, 27],
								  iconAnchor: [13, 27],
								  popupAnchor:  [1, -24],
								  iconUrl: 'leaflet/icons/' + getSymbol(purpose) + '.png'
									});
							//if the entity is a point, create a point. Otherwise, create a polyline.		
							if( ftypeName[3] == "gnis" || ftypeName[3] == "structures" || ftypeName[3] == "geonames")
							{
								latlngs = makeLatLngs(geometry); 
								marker = new L.marker(latlngs, {icon: smallIcon});
							}
							else if(ftypeName[3] == "trails")
							{
								latlngs = makeLatLngs(geometry); 
								marker = new L.polyline(latlngs,{color: '#228B22'});
							}
							else if(ftypeName[3] == "countyorequivalent" || ftypeName[3] == "stateorterritory")
							{
								latlngs = makeLatLngs(geometry,geometry2); 
								marker = new L.polygon(latlngs,{color: '#000000'});
							}
							else if(ftypeName[3] == "padus")
							{
								latlngs = makeLatLngs(null,null,geometry); 
								marker = new L.polygon(latlngs,{color: '#000000'});
							}
							marker.bindPopup("<br>Name: " +  name +'</a>' +
								"<br>Purpose: " + purpose +
								"<p> <a href='#' onClick=\"additionalInformation('"+uri+"');\">Additional Information</a><br>" +
								"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a></p>"
							);
							//Add the marker to the map layer
							grouping.addLayer(marker);
							}
							//Visualize the map layer
							grouping.addTo(map);
						}
					else { //0 results returned so do nothing.
						alert("Error! #2");
					}
				}
			}
		});	
	}
	//This function will make the latLngs given up to two geometries.
	function makeLatLngs(geometry1, geometry2, geometry3)
	{
		//Create a latlng array to store all fo the coordinates
		var latlngs = new Array();
		//go through the list of coordinates and add them to the latlng array
		if(geometry1 != null)
		{
			var coordinates = geometry1.split(" ");
			if(coordinates.length == 2)
			{
				latlngs.push(coordinates[1]);
				latlngs.push(coordinates[0]);
			}
			else 
			{
				for(var j = 0; j < coordinates.length-1; j+=2) {
					latlngs.push([coordinates[j+1], coordinates[j]]);
				}
			
				if(geometry2 != null)
				{
					var coordinates2 = geometry2.split(" ");
					for(var j = 1; j < coordinates2.length-1; j+=2) {
						latlngs.push([coordinates2[j+1], coordinates2[j]]);
					}
				}
			}
		}
		else if(geometry3 != null)
		{
			var multipolygon = geometry3.split('; ');
			for(var j=0; j < multipolygon.length; j++) {
				coordinates = multipolygon[j].split(" ");
				var templatlngs = new Array();
				for(var k = 0; k < coordinates.length-1; k+=2) 
				{				
					templatlngs.push([coordinates[k], coordinates[k+1]]);				
				}
				latlngs.push(templatlngs);
			}
		}
		return latlngs;
	}
	
	function getPADUS(){
		//Clear the current map layer
		clearMap();
		//Get the specified query
		var query = getQuery('PADUS');
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					alert('No results!');
				}
				else {
					bindings = result.results.bindings;
					//Check how many results there are. If 0 through an error. Otherwise, visualize them.
					if(bindings.length > 0) {
						//go through all of the results.
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							//featureToolTip = "Unknown";
							subject = bindings[i].subject.value;
							geometry = bindings[i].c.value;
							name = "Unknown";
							if(bindings[i].name != undefined)
							{
								name = bindings[i].name.value;
							}
							//Check if there is a purpose. Otherwise purpose will be "Unknown"
							purpose = "Unknown";
							if(bindings[i].purpose != undefined)
							{
								purpose = bindings[i].purpose.value;
							}

							//get the type name from the URI of the feature
							var latlngs = new Array();
							latlngs = makeLatLngs(null, null, geometry);

							//create a new polyline object with the given popup
							polygon = new L.polygon(latlngs,{color: '#000000'});
							polygon.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polygon);
						}
						//visualize the mapping layer
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						alert("Error!");
					}
				}
			}
		});
	}
	//This function will return the symbol that should be used for a particular feature type.
	function getSymbol(featureType){
		var symbol;
		switch(featureType){
		case "AIRP":
		case "Airport":
			symbol = "Airport";
		break;
		case "AREA":
		case "Area":
			symbol = "Area";
		break;
		case "BCH":
		case "Beach":
			symbol = "Beach";
		break;
		case "BDG":
		case "Bridge":
			symbol = "Bridge";
		break;
		case "BLDG":
		case "Building":
			symbol = "Building";
		break;
		case "Canal":
			symbol = "Canal";
		break;
		case "CAPE":
		case "Cape":
			symbol = "Cape";
		break;
		case "CMTY":
		case "Cemetery":
			symbol = "Cemetery";
		break;
		case "CHN":
		case "Channel":
			symbol = "Channel";
		break;
		case "CH":
		case "Church":
			symbol = "Church";
		break;
		case "Civil":
			symbol = "Civil";
		break;
		case "Crossing":
			symbol = "Crossing";
		break;
		case "DAM":
		case "Dam":
			symbol = "Dam";
		break;
		case "Gut":
			symbol = "Gut";
		break;
		case "HBR":
		case "Harbor":
			symbol = "Harbor";
		break;
		case "HSP":
		case "Hospital":
			symbol = "Hospital";
		break;
		case "ISL":
		case "Island":
			symbol = "Island";
		break;
		case "LK":
		case "Lake":
			symbol =  "Lake";
		break;
		case "Locale":
			symbol = "Locale";
		break;
		case "INSM":
		case "MILB":
		case "Military":
			symbol = "Military";
		break;
		case "Park":
		case "PRK":
			symbol = "Park";
		break;
		case "Pillar":
			symbol = "Pillar";
		break;
		case "PPL":
		case "Populated Place":
			symbol = "Populated Place";
		break;
		case "PO":
		case "Post Office":
			symbol = "Post Office";
		break;
		case "RES":
		case "Reserve":
			symbol = "Reserve";
		break;
		case "RSV":
		case "Reservoir":
			symbol = "Reservoir";
		break;
		case "SCH":
		case "School":
			symbol = "School";
		break;
		case "SPNG":
		case "Spring":
			symbol = "Spring";
		break;
		case "STM":
		case "Stream":
			symbol = "Stream";
		break;
		case "MT":
		case "Summit":
			symbol = "Summit";
		break;
		case "TOWR":
		case "Tower":
			symbol = "Tower";
		break;
		case "TRL":
		case "Trail":
			symbol = "Trail";
		break;
		case "VAL":
		case "Valley":
			symbol = "Valley";
		break;
		case "Woods":
			symbol = "Woods";
		break;
		default:
			symbol = "Unknown";
		}
		return symbol;
	}
	//This function will clear the map.
	function clearMap()
	{
		grouping.clearLayers();
	}