/* 
 * Map As A Knowledge Base functions for RDF processing operations
 */

var triggerLayers = {
	countyorequivalent: false,
	doSomething: false,
	geonames: false,
	gnis: false,
	nhdflowline: false,
	nhdline: false,
	nhdpoint: false,
	nhdwaterbody: false,
	padus: false,
	stateorterritory: false,
	structures: false,
	trails: false,
};  // An object used to check whether a layer is in use or not

// load the symbol IDs json from URL
var symbolLibrary = {};
$.getJSON('./makb/symbol_library.json', function(data) { symbolLibrary = data; });

//Function to make a query that can understand how to visualize all the different geometries
	function makeUniversalQuery(inputQuery){
		// TODO: Add below into trigger mechanics. There's an issue on gitlab
		//Check whether specific query has been applied
		// if (triggerLayers[inputQuery] == true) {
		// 	return;
		// } else {
		// 	triggerLayers[inputQuery] = true;
		// 	onLayerLoading(inputQuery);  // Lock down browser while loading
		// }
		onLayerLoading("user created query");  // Lock down browser while loading

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
					notification_manager.addToNotificationQueue("Warning", "No results while making universal query.");
				}
				else {
					bindings = result.results.bindings;
					//Check how many results there are. If 0 through an error. Otherwise, visualize them.
					if(bindings.length > 0) {
						//go through all of the results.
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							featureToolTip = "Unknown";
							geometry = bindings[i].geometry.value;
							
							uri = bindings[i].subject.value;
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
							
							//Check if there is a dimensions. Otherwise name will be "Unknown"
							dimensions = "Unknown";
							if(bindings[i].dimensions != undefined)
								dimensions = bindings[i].dimensions.value;
							
							//get the type name via the uri
							var ftypeName = uri.split("/");
							
							var latlngs = new Array();
							
							//get the coordinate information from the results
							//Create the icon for the results if it is a point
							var smallIcon = L.icon({
								  iconSize: [27, 27],
								  iconAnchor: [13, 27],
								  popupAnchor:  [1, -24],
								  iconUrl: 'leaflet/icons/' + getSymbol(purpose) + '.png'
									});
							//if the entity is a point, create a point. Otherwise, create a polyline or polygon.		
							if( ftypeName[3] == "gnis" || ftypeName[3] == "structures" || ftypeName[3] == "geonames" || ftypeName[3] == "nhdpoint")
							{
								latlngs = makeLatLngs(geometry); 
								marker = new L.marker(latlngs, {icon: smallIcon});
							}
							else if(ftypeName[3] == "trails" || ftypeName[3] == "nhdflowline" || ftypeName[3] == "nhdline")
							{
								//According to the number of dimension, properly visualize the geometry.
								if(dimensions = "3")
									latlngs = makeLatLngs(null,null,null,geometry);
								else
									latlngs = makeLatLngs(geometry); 
								
								marker = new L.polyline(latlngs,{color: getColor(ftypeName[3])});
							}
							/*else if (ftypeName[3] == "countyorequivalent")
							{
								alert("HERE!");
								latlngs = makeLatLngs(geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							}*/
						else if(ftypeName[3] == "countyorequivalent" || ftypeName[3] == "stateorterritory" || ftypeName[3]== "nhdwaterbody" )
							{
								if(dimensions == "3")
									latlngs = makeLatLngs(null,null,null,geometry);
								else
									latlngs = makeLatLngs(null,geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							}
							else if(ftypeName[3] == "padus")
							{
								latlngs = makeLatLngs(null,null,geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
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
						onLayerLoadingFinished("user created query");
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating universal query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Universal query failed.");
			}
		});
	}
//Function to make a point query and visualize the results.
	function makePointQuery(inputQuery){
		//Check whether specific query has been applied
		if (triggerLayers[inputQuery] == true) {
			return;
		} else {
			triggerLayers[inputQuery] = true;
			onLayerLoading(inputQuery);  // Lock down browser while loading
		}

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
					notification_manager.addToNotificationQueue("Warning", "No results while making point query.");
				}
				else {
					bindings = result.results.bindings;
					//Check how many results there are. If 0 through an error. Otherwise, visualize them.
					if(bindings.length > 0) {
						//go through all of the results.
						for(var i=0; i < bindings.length; i++) {
							//declare the variables given the results.
							featureToolTip = "Unknown";
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
							uri = bindings[i].subject.value;
							geometry = bindings[i].geometry.value;
							//Check if there is a wkt. Otherwise purpose will be "Unknown"
							wkt = "Unknown";
							if(bindings[i].wkt != undefined)
							{
								wkt = bindings[i].wkt.value;
							}
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
							var coordinates = geometry.split(" ");
							latlngs = makeLatLngs(geometry);
							//Create a marker with a popup
							circlePoint = new L.marker(latlngs, {icon: smallIcon}).bindTooltip(featureToolTip, {direction:'top'});
							circlePoint.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+uri+"');\">Additional Information</a><br>" +
									"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a><br>" +
									"<a href='#' onClick=\"nearbyPoints('"+wkt+"', '"+uri+"', '"+ftypeName[3]+"');\">Nearby Points</a><br>" +
									"<a href='#' onClick=\"createDBpediaQuery('"+name+"',"+coordinates[0]+","+coordinates[1]+");\">Dbpedia Info</a></p>"
									);
							//add the new marker for the given entity to the mapping layer.
							grouping.addLayer(circlePoint);
						}
						//visualize the mapping layer when all the markers have been added.
						grouping.addTo(map);
						onLayerLoadingFinished(inputQuery);
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating point query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Point query failed.");
			}
		});
	}
	//Function to make a line query and visualize the results.
	function makeLineQuery(inputQuery){
		//Check whether specific query has been applied
		if (triggerLayers[inputQuery] == true) {
			return;
		} else {
			triggerLayers[inputQuery] = true;
			onLayerLoading(inputQuery);  // Lock down browser while loading
		}

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
					notification_manager.addToNotificationQueue("Warning", "No results while creating line query.");
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
							//dimensions = bindings[i].dimensions.value;
							var ftypeName = subject.split("/");
							//Check if there is a dimensions. Otherwise name will be "Unknown"
							dimensions = "Unknown";
							if(bindings[i].dimensions != undefined)
							{
								dimensions = bindings[i].dimensions.value;
							}
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
							//Check if there are three dimensions. If so, do the following.
							if(dimensions == "3")
								latlngs = makeLatLngs(null,null,null,geometry);
							else
								latlngs = makeLatLngs(geometry);
							//create a new polyline object with the given popup
							polyLine = new L.polyline(latlngs,{color: getColor(ftypeName[3])});
							polyLine.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polyLine);
						}
						//visualize the mapping layer
						grouping.addTo(map);
						onLayerLoadingFinished(inputQuery);
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating line query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Line query failed.");
			}
		});
	}
	//Function to make a line query and visualize the results.
	function makePolygonQuery(inputQuery){
		//Check whether specific query has been applied
		if (triggerLayers[inputQuery] == true) {
			return;
		} else {
			triggerLayers[inputQuery] = true;
			onLayerLoading(inputQuery);  // Lock down browser while loading
		}

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
					notification_manager.addToNotificationQueue("Warning", "No results while creating polygon query.");
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
							//dimensions = bindings[i].dimensions.value;
							var ftypeName = subject.split("/");
							//Check if there is a dimensions. Otherwise name will be "Unknown"
							dimensions = "Unknown";
							if(bindings[i].dimensions != undefined)
							{
								dimensions = bindings[i].dimensions.value;
							}
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
							if(dimensions == "3")
								latlngs = makeLatLngs(null,null,null,geometry);
							else
								latlngs = makeLatLngs(null,geometry);
							//create a new polyline object with the given popup
							polygon = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							polygon.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" +
									"<a href='#' onClick=\"entitiesWithin('"+geometry.replace("  ","")+"','"+subject+"','"+ftypeName[3]+"');\">Entities Within</a><br> </p>"
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polygon);
						}
						//visualize the mapping layer
						grouping.addTo(map);
						onLayerLoadingFinished(inputQuery);
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating polygon query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Polygon query failed.");
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
					notification_manager.addToNotificationQueue("Warning", "No results while creating additional information.");
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
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating additional information.");
					}
					//Create the tab for the additional information.
					createTab('Additional Information', HTML);
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Creating additional information failed.");
			}
		});
	}
	//Function to return a query based on the input information
	function getQuery(queryType, URI)
	{
		var query;
		if(queryType == null)
		{
			notification_manager.addToNotificationQueue("Error", "No query selected.");
			return null;
		}
		switch(queryType){
			//This query is for the GNIS layer
		case "gnis":
			query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ?wkt ' +
			'FROM <http://localhost:8080/marmotta/context/gnis> ' +
			'WHERE { ' +
				'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
				'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
				'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
				'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'} ';
		break;
			//This query is for the Geonames layer
		case "geonames":
		query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ?wkt ' +
			'FROM <http://localhost:8080/marmotta/context/geonames> ' +
			'WHERE { ' +
				'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
				'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
				'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
				'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'} ';
		break;
			//This query is for the Structures layer
		case "structures":
		query = 'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ?wkt ' +
			'FROM <http://localhost:8080/marmotta/context/structures> ' +
			'WHERE { ' +
				'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
				'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
				'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
				'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
				'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'} ';
		break;
			//This query is for the Trails layer
		case "trails":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the NHDFlowline layer
		case "nhdflowline":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ?wkt ' +
		'FROM NAMED <http://localhost:8080/marmotta/context/nhdflowline> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the NHDLine layer
		case "nhdline":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ?wkt ' +
		'FROM NAMED <http://localhost:8080/marmotta/context/nhdline> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the NHDPoint layer
		case "nhdpoint":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ?wkt ' +
		'FROM NAMED <http://localhost:8080/marmotta/context/nhdpoint> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?wkt . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the county layer
		case "countyorequivalent":
		query = 'SELECT ?subject ?geom ?dimensions ?purpose ?name ?geometry ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the NHDWaterbody layer
		case "nhdwaterbody":
		query = 'SELECT ?subject ?geom ?purpose ?name ?dimensions ?geometry ' + 
		'FROM NAMED <http://localhost:8080/marmotta/context/nhdwaterbody> ' +
		'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' ;
		break;
			//This query is for the State layer
		case "stateorterritory":
		query = 'SELECT ?subject ?gm ?dimensions ?purpose ?name ' + 
		'(GROUP_CONCAT(DISTINCT ?geo; SEPARATOR=";") AS ?geometry) '+
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?gm . ' +
			'?gm <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?gm <http://www.opengis.net/ont/geosparql#asGML> ?geo . '+
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
		'}}' +
		'GROUP BY ?subject ?gm ?purpose ?name ?dimensions';
		break;
			//This query is for the PADUS layer
		case "padus":
		query = 'SELECT ?subject ?gm ?purpose ?name '+
		'(GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) '+
		'FROM NAMED <http://localhost:8080/marmotta/context/padus> '+
		'WHERE { GRAPH ?g { '+
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?gm . '+
			'?gm <http://www.opengis.net/ont/geosparql#asGML> ?geo . '+
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } '+
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } '+
		'}} '+
		'GROUP BY ?subject ?gm ?purpose ?name ';
		break;
			//This query is for Custom queries. However, it is not currently in use
		case "Custom":
			query = document.getElementById('queryText').value;
			break;
			//This query is for the additional information link
		case "moreInfo":
			query = 'SELECT * FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/padus> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdwaterbody> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdflowline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdpoint> ' +
			'WHERE { GRAPH ?g {<' + URI + '> ?property ?object }}';
			break;
			//If this function gets called without a query then there must have been an error.
		default:
			query = queryType;
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
			var query = 'SELECT ?subject ?geom ?name ?purpose '+queryData+' (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/padus> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdwaterbody> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdflowline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdpoint> ' +
			'WHERE { GRAPH ?g { ' + 
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' + queryFields + 
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			' } ' +
			'FILTER regex( '+filterProperty+' , "'+object+'")  } ' +
			'GROUP BY ?subject ?geom ?name ?purpose '+queryData+' ' ;
		}
		//Check if the user is asking for a geometry.
		else if(property == "http://www.opengis.net/ont/geosparql#hasGeometry")
		{	
			var query = 'SELECT  ?subject ?geometry2 ?dimensions (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/padus> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdwaterbody> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdflowline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdline> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/nhdpoint> ' +
			'WHERE { GRAPH ?g { ' +
			'?subject <http://www.opengis.net/ont/geosparql#asGML> ?geo . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/coordinates> ?geometry2 . } ' +
			' } ' +
			'FILTER regex( ?subject , "'+object+'")  } ' + 
			'GROUP BY ?subject ?geometry2 ?dimensions';
		}
		//Check if the user is requesting a state attribute
		else if(property == "http://data.usgs.gov/ontology/structures/hasState" || property == "http://dbpedia.org/ontology/state")
		{
			var query = 'SELECT (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR="; ") AS ?geometry) ?geometry2 ?dimensions ?purpose ?name ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'WHERE { GRAPH ?g { ' + 
			'<'+object+'> <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geo . '+
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'OPTIONAL { ?geom <http://dbpedia.org/ontology/coordinates> ?geometry2 . } ' +
			'OPTIONAL { <'+object+'> <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'OPTIONAL { <'+object+'> <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			' } ' +
			' } ' +
			'GROUP BY ?geom ?geometry2 ?dimensions ?purpose ?name';
		}
		//check if the user is requesting a county attribute
		else if(property == "http://dbpedia.org/ontology/county")
		{
			var query = 'SELECT ?geometry ?dimensions ?purpose ?name ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/geonames> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/structures> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/trails> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
			'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
			'WHERE { GRAPH ?g { ' + 
			'<'+object+'> <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
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
					notification_manager.addToNotificationQueue("Warning", "No results for IRI search.");
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
							//Check if there is a subject in the data. If there is, update the uri.
							dimensions = "Unknown";
							if(bindings[i].dimensions != undefined)
							{
								dimensions = bindings[i].dimensions.value;
							}
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
							
							//get the coordinate information from the results
							//Create the icon for the results if it is a point
							var smallIcon = L.icon({
								  iconSize: [27, 27],
								  iconAnchor: [13, 27],
								  popupAnchor:  [1, -24],
								  iconUrl: 'leaflet/icons/' + getSymbol(purpose) + '.png'
									});
							//if the entity is a point, create a point. Otherwise, create a polyline or polygon.		
							if( ftypeName[3] == "gnis" || ftypeName[3] == "structures" || ftypeName[3] == "geonames")
							{
								latlngs = makeLatLngs(geometry); 
								marker = new L.marker(latlngs, {icon: smallIcon});
							}
							else if(ftypeName[3] == "trails" || ftypeName[3] == "nhdflowline")
							{
								if(dimensions == "3")
									latlngs = makeLatLngs(null,null,null,geometry);
								else
									latlngs = makeLatLngs(geometry); 
								marker = new L.polyline(latlngs,{color: getColor(ftypeName[3])});
							}
							else if(ftypeName[3] == "countyorequivalent" || ftypeName[3] == "stateorterritory" || ftypeName[3] == "nhdwaterbody")
							{
								if(dimensions == "3")
									latlngs = makeLatLngs(null,null,null,geometry);
								else
									latlngs = makeLatLngs(null,geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							}
							else if(ftypeName[3] == "padus")
							{
								latlngs = makeLatLngs(null,null,geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
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
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating IRI search.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "IRI search failed.");
			}
		});	
	}
	//This function will make the latLngs for three different types of stored geometries
	function makeLatLngs(geometry1, geometry2, geometry3, geometry4)
	{
		//Create a latlng array to store all fo the coordinates
		var latlngs = new Array();
		//These geometries are basic points, polylines or polygons.
		if(geometry1 != null)
		{
			var coordinates = geometry1.split(" ");
			if(coordinates.length == 2 || coordinates.length == 3)
			{
				latlngs.push(coordinates[0]);
				latlngs.push(coordinates[1]);
			}
			else 
			{
				for(var j = 0; j < coordinates.length-1; j+=2) {
					latlngs.push([coordinates[j+1], coordinates[j]]);
				}
			}
		}
		//These will be geometries that were broken in half due to storage constraints
		else if(geometry2 != null)
		{
			var multipolygon = geometry2.split(';');
			for(var j=0; j < multipolygon.length; j++) {
				//alert(multipolygon);
				
				coordinates = multipolygon[j].split(" ");
				//alert(coordinates[0]);
				//alert(coordinates[coordinates.length]);
				var templatlngs = new Array();
				for(var k = 2; k < coordinates.length-1; k+=2) 
				{				
					latlngs.push([coordinates[k], coordinates[k+1]]);				
				}
			}
		}
		//These will be multi-geometries where a single geometries contains many different polygons, lines, etc.
		//NOTE, this has only been applied to PADUS data. The data is returning to us swapped coordinates. Need to figure out why then standardize the function.
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
		else if(geometry4 != null)
		{
			var coordinates = geometry4.split(" ");
			if(coordinates.length == 3)
			{
				latlngs.push(coordinates[0]);
				latlngs.push(coordinates[1]);
			}
			else 
			{
				for(var j = 0; j < coordinates.length-1; j+=3) {
					latlngs.push([coordinates[j], coordinates[j+1]]);
				}
			}
		} 
		
		return latlngs;
	}
	
	//This function maps PADUS data.
	function makeMultiPolygonQuery(){
		//Check whether specific query has been applied
		if (triggerLayers['padus'] == true) {
			return;
		} else {
			triggerLayers['padus'] = true;
			onLayerLoading("PADUS");  // Lock down browser while loading
		}

		//Get the specified query
		var query = getQuery('padus');
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating multi-polygon query.");
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
							geometry = bindings[i].geometry.value;
							var ftypeName = subject.split("/");
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
							polygon = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							polygon.bindPopup("<br>Name: " +  name +'</a>' +
									"<br>Purpose: " + purpose +
									"<p> <a href='#' onClick=\"additionalInformation('"+subject+"');\">Additional Information</a><br>" 
									);
							//add the polyline object to the mapping layer
							grouping.addLayer(polygon);
						}
						//visualize the mapping layer
						grouping.addTo(map);
						onLayerLoadingFinished("PADUS")
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating multi-polygon query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Multi-polygon query failed.");
			}
		});
	}
	
	//This function performs a GeoSPARQL query to look-up and find nearby points
	function nearbyPoints(inputGeometry,URI,namespace){
		clearMap();
		notification_manager.addToNotificationQueue("Other", "Input geometry: " + inputGeometry + ".");
		//Get the specified query
		var query = 
			'PREFIX geo: <http://www.opengis.net/ont/geosparql#> ' +
			'PREFIX geof: <http://www.opengis.net/def/function/geosparql/> ' +
			'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> ' +
			'PREFIX sf: <http://www.opengis.net/ont/sf#> ' +
			'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ' +
			'SELECT ?subject ?name ?lat ?long ?purpose ?geom ?geometry ?dimensions ' +
			'FROM <http://localhost:8080/marmotta/context/'+namespace+'> ' +
			'WHERE { ' +
			'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
			'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
			'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
			'?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . ' +
			'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?gWKT . ' +
			'BIND(CONCAT("SRID=4326;",STR(?gWKT),"") AS ?strWKT) . ' +
			'BIND("SRID=4326;'+inputGeometry+'"^^geo:wktLiteral AS ?inputPoint ) . ' +
			'BIND( geof:buffer(?inputPoint, .02 , units:degree) AS ?area ) ' +
			'FILTER( geof:sfWithin(?strWKT, ?area) )' +
			'} ';
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating nearby points query.");
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
									"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a><br>" +
									"<a href='#' onClick=\"nearbyPoints('"+geometry+"', '"+uri+"');\">Nearby Points</a></p>"
									);
							//add the new marker for the given entity to the mapping layer.
							grouping.addLayer(circlePoint);
						}
						//visualize the mapping layer when all the markers have been added.
						grouping.addTo(map);
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating nearby points query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Nearby points query failed.");
			}
		});
	}
	
	
	//This function performs a GeoSPARQL query to look-up and find geometries withing the current geometry.
	function entitiesWithin(inputGeometry,URI,namespace){
		//Check whether specific query has been applied
		if (triggerLayers["doSomething"] == true) {
			return;
		} else {
			triggerLayers["doSomething"] = true;
			onLayerLoading("doSomething");  // Lock down browser while loading
		}

		//notification_manager.addToNotificationQueue("Other", "Input geometry: " + inputGeometry + ".");
		//Get the specified query

		if (namespace == "countyorequivalent")
			var query = 
				'PREFIX geo: <http://www.opengis.net/ont/geosparql#> ' +
				'PREFIX geof: <http://www.opengis.net/def/function/geosparql/> ' +
				'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> ' +
				'PREFIX sf: <http://www.opengis.net/ont/sf#> ' +
				'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ' +
				'SELECT ?subject ?name ?purpose ?dimensions ?geometry ?flWKT ' +
				'FROM NAMED <http://localhost:8080/marmotta/context/countyorequivalent> ' +
				'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
				'WHERE { ' +
					'GRAPH ?g { ' +
					'<'+URI+'> geo:hasGeometry ?gWB . ' +
					'?gWB <http://www.opengis.net/ont/geosparql#asWKT> ?geo . ' +
					'BIND(CONCAT("SRID=4326;", STR(?geo)) AS ?wbStrWKT) . ' +
					'GRAPH ?h { ' +
					'?subject geo:hasGeometry ?gFL . ' +
					'OPTIONAL { ?subject <http://purl.org/dc/elements/1.1/title> ?name . } ' +
					'OPTIONAL { ?subject <http://dbpedia.org/ontology/purpose> ?purpose . } ' +
					'?gFL geo:asWKT ?flWKT . ' +
					'?gFL geo:asGML ?geometry . ' +
					'?gFL geo:dimension ?dimensions . ' +
					'BIND(CONCAT("SRID=4326;",STR(?flWKT),"") AS ?flStrWKT) . ' +
					'} ' +
				'FILTER (geof:sfWithin(?flStrWKT, ?wbStrWKT) && ?flStrWKT != ?wbStrWKT) ' +
				'}} ';

		else if (namespace == "stateorterritory")
			var query = 
				'PREFIX geo: <http://www.opengis.net/ont/geosparql#> ' +
				'PREFIX geof: <http://www.opengis.net/def/function/geosparql/> ' +
				'PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> ' +
				'PREFIX sf: <http://www.opengis.net/ont/sf#> ' +
				'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> ' +
				'SELECT  ?subject ?name ?purpose ?dimensions ?geometry ?strWKT ' +
				'FROM NAMED <http://localhost:8080/marmotta/context/gnis> ' +
				'FROM NAMED <http://localhost:8080/marmotta/context/stateorterritory> ' +
				'WHERE { ' +
  					'{ ' +
					'SELECT * WHERE{ ' +
    						'GRAPH ?h{ ' +
      							'?subject <http://www.opengis.net/ont/geosparql#hasGeometry> ?geom . ' +
      							'?subject <http://purl.org/dc/elements/1.1/title> ?name . ' +
      							'?subject <http://dbpedia.org/ontology/purpose> ?purpose . ' +
      							'OPTIONAL{ ?geom <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . } ' +
      							'OPTIONAL{ ?geom <http://www.opengis.net/ont/geosparql#asGML> ?geometry . } ' +
      							'?geom <http://www.opengis.net/ont/geosparql#asWKT> ?gWKT . ' +
      							'BIND(CONCAT("SRID=4326;",STR(?gWKT),"") AS ?strWKT) . ' +
      							'} ' +
	    					'Filter( regex(?strWKT, "POINT") ) ' +
    						'} ' +
  					'} ' +
  					'{ ' +
  					'SELECT ?gm (GROUP_CONCAT(DISTINCT ?geo; SEPARATOR=" ") AS ?inputGeometry) ' +
					'(CONCAT("SRID=4326; MULTIPOLYGON(((", (REPLACE(STR(?inputGeometry), " -", ", -")) ,")))") AS ?step1) ' +
  					'WHERE { ' +
						'GRAPH ?g { ' +
    							'<'+URI+'>  <http://www.opengis.net/ont/geosparql#hasGeometry> ?gm . ' +
    							'?gm <http://www.opengis.net/ont/geosparql#dimension> ?dimensions . ' +
    							'?gm <http://www.opengis.net/ont/geosparql#asWKT> ?geo . ' +
    							'} '+
					'} ' +
    					'GROUP BY ?gm ?dimensions' +
  					'} ' +
  					'FILTER( geof:sfWithin(?strWKT, ?step1) ) ' +
				'}';

		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var httpGet = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating entities within query.");
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
									"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a><br>" 
									);
							//add the new marker for the given entity to the mapping layer.
							grouping.addLayer(circlePoint);
						}
						//visualize the mapping layer when all the markers have been added.
						grouping.addTo(map);
						onLayerLoadingFinished("doSomething");
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating entities within query.");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Entities within query failed.");
			}
		});
	}
	
	//This function will return the color for a specific polygon/polyline object
	function getColor(featureType){
		var color;
		switch(featureType){
			case "trails":
				color = '#228B22';
				break;
			case "stateorterritory":
				color = '#000000';
				break;
			case "countyorequivalent":
				color = '#696969';
				break;
			case "padus":
				color = '#B22222';
				break;
			default:
				color = '#000000';
		}
		return color;
	}
	//This function will return the symbol that should be used for a particular feature type.
	function getSymbol(featureType){
		return symbolLibrary[featureType];	
	}