// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Map As A Knowledge Base functions for RDF processing operations.

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
$.getJSON('./makb/symbol-library.json', function(data) { symbolLibrary = data; });

// load the query IDs json from URL
var queryLibrary = {};
$.getJSON('./makb/query-library.json', function(data) { queryLibrary = data; });

// load the color IDs json from URL
var colorLibrary = {};
$.getJSON('./makb/color-library.json', function(data) { colorLibrary = data; });

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
		onLayerLoading("doSomething");  // Lock down browser while loading

		//Get the specified query
		var query = getQuery(inputQuery);
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while making universal query.");
					onLayerLoadingFinished("doSomething");
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
								if(dimensions == "3")
									latlngs = makeLatLngs(null,null,null,geometry);
								else if (ftypeName[3] == 'nhdflowline')
									latlngs = makeLatLngs(null,null,null,geometry);
								else
									latlngs = makeLatLngs(geometry); 
								
								marker = new L.polyline(latlngs,{color: getColor(ftypeName[3])});
							}
							/*else if (ftypeName[3] == "countyorequivalent")
							{
								("HERE!");
								latlngs = makeLatLngs(geometry); 
								marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
							}*/
						else if(ftypeName[3] == "countyorequivalent" || ftypeName[3] == "stateorterritory" || ftypeName[3] == "nhdwaterbody")
							{
								if(dimensions == "3" || ftypeName[3] == "nhdwaterbody")
									latlngs = makeLatLngs(null,null,null,geometry);
								else if (ftypeName[3] == "stateorterritory")
									latlngs = makeLatLngs(null, geometry, null, null); 
								else
									latlngs = makeLatLngs(geometry, null, null, null); 

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
						onLayerLoadingFinished("doSomething");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Universal query failed.");
				onLayerLoadingFinished("doSomething");
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
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while making point query.");
					onLayerLoadingFinished(inputQuery);
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
						onLayerLoadingFinished(inputQuery);
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Point query failed.");
				onLayerLoadingFinished(inputQuery);
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
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating line query.");
					onLayerLoadingFinished(inputQuery);
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
						onLayerLoadingFinished(inputQuery);
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Line query failed.");
				onLayerLoadingFinished(inputQuery);
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
		debugger;
		//get the http requuest URL
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating polygon query.");
					onLayerLoadingFinished(inputQuery);
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
						onLayerLoadingFinished(inputQuery);
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Polygon query failed.");
				onLayerLoadingFinished(inputQuery);
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
		var http_get = MARMOTTA_SPARQL_URL + query;
		//create an object to store the HTML for the additional information tab and declare the first line
		var HTML = "<b>Universal Resource Identifier: &nbsp; </b> "+URI+"<br>";
		// execute sparql query in marmotta
		$.get({url: http_get, 
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
							if (bindings[i].property.value!="http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
								HTML+=
								"<b>" + bindings[i].property.value + ": &nbsp; </b> <a href='#' onClick=\"IRISearch('"+
								bindings[i].property.value+"','"+ bindings[i].object.value + "');\">" + 
								bindings[i].object.value + "</a><br>";
							else 
								HTML+=
								"<b>" + bindings[i].property.value + ": &nbsp; </b> <a>" + 
								bindings[i].object.value + "</a><br>";
						}
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating additional information.");
					}
					//Create the tab for the additional information.
					createTab('Additional Information', HTML);

					// Display/Update the afd tab section after everything is created
					displayUpdateAFDWidget();
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Creating additional information failed.");
			}
		});
	}
	//Function to return a query based on the input information
	function getQuery(queryType, INPUT_STRING_1, INPUT_STRING_2, INPUT_STRING_3, INPUT_STRING_4,
		INPUT_STRING_5, INPUT_STRING_6, INPUT_STRING_7 ,INPUT_STRING_8, INPUT_STRING_9, INPUT_STRING_10)
	{
		var query;
		//Check if a query was passed in. If it wasn't, throw an error.
		if(queryType == null)
		{
			notification_manager.addToNotificationQueue("Error", "No query selected.");
			return null;
		}
		//If it is a custom query, simply retrieve the contents of the query box.
		if(queryType == "Custom")
		{
			query = document.getElementById(query_tab_id+'-qb-generated-query').value;
		}
		//Pull in the correct query from the query library. replace the holders with the 
		//	inputs if they exist.
		else
		{
			query = (queryLibrary[queryType]).join(" ");
			if (INPUT_STRING_1 != null)
				query = query.replace("INPUT_STRING_1", INPUT_STRING_1);
			if (INPUT_STRING_2 != null)
				query = query.replace("INPUT_STRING_2", INPUT_STRING_2);
			if (INPUT_STRING_3 != null)
				query = query.replace("INPUT_STRING_3", INPUT_STRING_3);
			if (INPUT_STRING_4 != null)
				query = query.replace("INPUT_STRING_4", INPUT_STRING_4);
			if (INPUT_STRING_5 != null)
				query = query.replace("INPUT_STRING_5", INPUT_STRING_5);
			if (INPUT_STRING_6 != null)
				query = query.replace("INPUT_STRING_6", INPUT_STRING_6);
			if (INPUT_STRING_7 != null)
				query = query.replace("INPUT_STRING_7", INPUT_STRING_7);
			if (INPUT_STRING_8 != null)
				query = query.replace("INPUT_STRING_8", INPUT_STRING_8);
			if (INPUT_STRING_9 != null)
				query = query.replace("INPUT_STRING_9", INPUT_STRING_9);
			if (INPUT_STRING_10 != null)
				query = query.replace("INPUT_STRING_10", INPUT_STRING_10);
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
		/* 
			ONCE THE OTHER TWO CONDITIONS ARE ADDED BACK IN, UNCOMMENT THE OTHER CONDITIONS
		*/
		if(property != "http://www.opengis.net/ont/geosparql#hasGeometry" //&& 
		//property != "http://data.usgs.gov/ontology/structures/hasState" && 
		//property != "http://dbpedia.org/ontology/county" && 
		//property != "http://dbpedia.org/ontology/state"
		)
		{	
			var query = getQuery("IRI_Search_1", queryData, queryFields, filterProperty, object, queryData);
		}
		//Check if the user is asking for a geometry.
		else if(property == "http://www.opengis.net/ont/geosparql#hasGeometry")
		{	
			var query = getQuery("IRI_Search_2", object);
		}
		//Check if the user is requesting a state attribute. If so, navigate to that URI.

		/* 
			THIS CODE CHUNK IS CURRENTLY NOT BEING USED.
			It is supposed to allow users to link between the IRIs of entities. However, the IRIs
			are currently not in the prototype. Thus, these query do not function.
		*/
		/*else if(property == "http://data.usgs.gov/ontology/structures/hasState" || 
		property == "http://dbpedia.org/ontology/state")
		{
			var query = getQuery("IRI_Search_3", object, object, object);
		}
		//check if the user is requesting a county attribute
		else if(property == "http://dbpedia.org/ontology/county")
		{
			var query = getQuery("IRI_Search_4", object, object, object);
		}*/
		//Encode the query.
		query = encodeURIComponent(query);
		//Get the URL for the http query request
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
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
					latlngs.push([coordinates[j], coordinates[j+1]]);
				}
			}
		}
		//These will be geometries that were broken in half due to storage constraints
		else if(geometry2 != null)
		{
			var multipolygon = geometry2.split(';');
			for(var j=0; j < multipolygon.length; j++) {
				
				coordinates = multipolygon[j].split(" ");
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
			var multipolygon = geometry3.split(';');
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
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating multi-polygon query.");
					onLayerLoadingFinished("PADUS")
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
						onLayerLoadingFinished("PADUS")
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Multi-polygon query failed.");
				onLayerLoadingFinished("PADUS")
			}
		});
	}
	
	//This function performs a GeoSPARQL query to look-up and find nearby points
	function nearbyPoints(inputGeometry,URI,namespace){
		clearMap();

		//Check whether specific query has been applied
		if (triggerLayers["doSomething"] == true) {
			return;
		} else {
			triggerLayers["doSomething"] = true;
			onLayerLoading("doSomething");  // Lock down browser while loading
		}
		//Get the specified query
		var query = getQuery("nearbyPoints", namespace, inputGeometry);
		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating nearby points query.");
					onLayerLoadingFinished("doSomething");
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
						onLayerLoadingFinished("doSomething");
					}
					else { //There was no results so do nothing.
						notification_manager.addToNotificationQueue("Warning", "No results for bindings while creating nearby points query.");
						onLayerLoadingFinished("doSomething");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Nearby points query failed.");
				onLayerLoadingFinished("doSomething");
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

		//Get the specified query
		if (namespace == "countyorequivalent")
			var query = getQuery("entitiesWithin_countyorequivalent",URI)

		else if (namespace == "stateorterritory")
			var query = getQuery("entitiesWithin_stateorterritory",URI)

		//HTTP encode the query
		query = encodeURIComponent(query);
		//Create the URL for the HTTP request
		var http_get = MARMOTTA_SPARQL_URL + query;
		// execute sparql query in marmotta
		$.get({url: http_get, 
			success: function(result) {
				//If there are no results say so. Otherwise, visualize them.
				if(!result) {
					notification_manager.addToNotificationQueue("Warning", "No results while creating entities within query.");
					onLayerLoadingFinished("doSomething");
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
						onLayerLoadingFinished("doSomething");
					}
				}
			},
			error: function(result) {
				notification_manager.addToNotificationQueue("Error", "Entities within query failed.");
				onLayerLoadingFinished("doSomething");
			}
		});
	}
	
	//This function will return the color for a specific polygon/polyline object
	function getColor(featureType){
		var color = colorLibrary[featureType];
		if(color == null) {
			color = colorLibrary["default"];
		}
		return color;
	}
	//This function will return the symbol that should be used for a particular feature type.
	function getSymbol(featureType){
		return "images/" + symbolLibrary[featureType];	
	}