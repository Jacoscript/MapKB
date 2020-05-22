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
function makeUniversalQuery_v2(inputType, inputQuery){
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
    var query = getQuery(inputType, inputQuery);
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
                console.log(result.results.bindings);
                bindings = result.results.bindings;
                //Check how many results there are. If 0 through an error. Otherwise, visualize them.
                if(bindings.length > 0) {
                    //go through all of the results.
                    for(var i=0; i < bindings.length; i++) {
                        //declare the variables given the results.
                        featureToolTip = "Unknown";
                        //ccgeometry = bindings[i].geometry.value;
                        
                        uri = bindings[i].subject.value;
                        if(bindings[i].subject != undefined)
                            uri = bindings[i].subject.value;
                        
                        //If there is no name, set to Unknown
                        // name = "Unknown";
                        // if(bindings[i].name != undefined)
                        //     name = bindings[i].name.value;

                        //If there is no fcode or feature_Class, set to Unknown
                        // fcode is used to determine the mapping symbol
                        symbol = "Unknown";
                        if(bindings[i].fcode != undefined)
                            symbol = bindings[i].fcode.value;
                        else if(bindings[i].feature_Class != undefined)
                            symbol = bindings[i].feature_Class.value;

                        //If there is no trailType, set to Unknown
                        // trailType is used to determine the mapping symbol.
                        trailType = "Unknown";
                        if(bindings[i].trailType != undefined)
                            trailType = bindings[i].trailType.value;

                        //If there is no gml, set to Unknown
                        // gml is used to create the geometry
                        gml = "Unknown";
                        if(bindings[i].gml != undefined)
                            gml = bindings[i].gml.value;
                        
                        //If there is no purpose, set to Unknown
                        // purpose = "Unknown";
                        // if(bindings[i].purpose != undefined)
                        //     purpose = bindings[i].purpose.value;
                        
                        //Check if there is a dimensions. Otherwise name will be "Unknown"
                        //This is used to determine the difference between a 2d and 3d geometry.
                        dimensions = "Unknown";
                        if(bindings[i].dimensions != undefined)
                            dimensions = bindings[i].dimensions.value;
                        
                        //get the type name via the uri
                        var ftypeName = uri.split("/");
                        
                        var latlngs = new Array();
                        
                        //console.log(ftypeName);
                        //if the entity is a point, create a point. 		
                        if( ftypeName[5]=="struct_point" || ftypeName[5] == "trans_airportpoint" || ftypeName[5] == "nhdpoint" 
                        || ftypeName[5] == "state_and_county_code" || ftypeName[5] == "concise_feature")
                        {
                            //get the coordinate information from the results
                            //Create the icon for the results if it is a point
                            var smallIcon = L.icon({
                                iconSize: [27, 27],
                                iconAnchor: [13, 27],
                                popupAnchor:  [1, -24],
                                iconUrl: getSymbol(symbol) + '.png'
                                });

                            latlngs = makeLatLngs_v2(gml); 
                            marker = new L.marker(latlngs, {icon: smallIcon});
                        }
                        //if the entity is a polyline do the following
                        else if(ftypeName[5] == "trans_roadsegment" || ftypeName[5] == "trans_trailsegment" 
                        || ftypeName[5] == "trans_railfeature" || ftypeName[5] == "nhdline" || ftypeName[5] == "nhdflowline"
                        || ftypeName[5] == "wbdline" || ftypeName[5] == "nhdplusburnlineevent")
                        {
                            //According to the number of dimension, properly visualize the geometry.
                            if(dimensions == "3")
                                latlngs = makeLatLngs_v2(null,null,null,gml);
                            // else if (ftypeName[5] == 'nhdflowline')
                            //     latlngs = makeLatLngs(null,null,null,geometry);
                            else
                                latlngs = makeLatLngs_v2(gml); 
                            
                            marker = new L.polyline(latlngs,{color: getColor(ftypeName[5])});
                        }
                        //if the entity is a normal polygon do the following
                        else if (ftypeName[5] == "gu_minorcivildivision" || ftypeName[5] == "gu_incorporatedplace" || ftypeName[5] == "gu_jurisdictional"
                        || ftypeName[5] == "trans_airportrunway" || ftypeName[5] == "gu_reserve" || ftypeName[5] == "wbdhu10" || ftypeName[5] == "wbdhu12" 
                        || ftypeName[5] == "nhdpluscatchment" || ftypeName[5] == "wbdhu8" || ftypeName[5] == "nhdwaterbody" )
                        {
                            if(dimensions == "3")
                                latlngs = makeLatLngs_v2(null,null,null,gml);
                            else
                                latlngs = makeLatLngs_v2(gml); 

                            marker = new L.polygon(latlngs,{color: getColor(ftypeName[5])});
                        }

                        //if the entity is a split polygon, do the following.
                        else if(ftypeName[5] == "gu_stateorterritory" || ftypeName[5] == "gu_countyorequivalent"  
                        || ftypeName[5] == "nhdarea"  || ftypeName[5] == "wbdhu4" 
                        || ftypeName[5] == "wbdhu6" || ftypeName[5] == "nhdpluslandsea")
                        {
                            remakeGeo(bindings);
                            break;
                            // if(dimensions == "3" || ftypeName[3] == "nhdwaterbody")
                            //     latlngs = makeLatLngs2(null,null,null,gml);
                            // else if (ftypeName[3] == "stateorterritory")
                            //     latlngs = makeLatLngs2(null, gml, null, null); 
                            // else
                            //     latlngs = makeLatLngs2(gml, null, null, null); 

                            marker = new L.polygon(latlngs,{color: getColor(ftypeName[5])});
                            }
                    //     else if(ftypeName[3] == "padus")
                    //     {
                    //         latlngs = makeLatLngs(null,null,geometry); 
                    //         marker = new L.polygon(latlngs,{color: getColor(ftypeName[3])});
                    //     }
                        marker.bindPopup(//"<br>Name: " +  name +'</a>' +
                            //"<br>Purpose: " + purpose +
                            " "+uri+"<br> " +
                            "<p> <a href='#' onClick=\"additionalInformation_v2('"+uri+"');\">Additional Information</a><br>" +
                            "<p> <a href='#' onClick=\"makeUniversalQuery_v2('nearbyRoad');\">Nearby</a><br>"
                            //"<a href='#' onClick=\"getAdvFtrDesc('"+ftypeName[3]+"', '"+uri+"');\">Advanced Feature Description</a></p>"
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

//Function to perform an IRI search for a user
function IRISearch_v2(property, object){
    console.log(property);
    console.log(object);
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

    console.log(query);
    makeUniversalQuery_v2("Custom", query);
    
}

//This function will make the latLngs for three different types of stored geometries
function makeLatLngs_v2(geometry1, geometry2, geometry3, geometry4)
{
    //Create a latlng array to store all fo the coordinates
    var latlngs = new Array();
    //These geometries are basic 2d or 3d points, 2d polylines or 2d polygons.
    if(geometry1 != null)
    {
        var coordinates = "";

        if (geometry1.includes("<gml:pos>"))
        {
            coordinates = geometry1.split("<gml:pos>");
            coordinates = coordinates[1].split("</gml:pos>");
            coordinates = coordinates[0];
            coordinates = coordinates.split(" ");
        }
        else if(geometry1.includes("<gml:posList>"))
        {
            coordinates = geometry1.split("<gml:posList>");
            coordinates = coordinates[1].split("</gml:posList>");
            coordinates = coordinates[0];
            coordinates = coordinates.split(" ");
        }
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
    //These geometries are those that are broken into four segments due to storage constraints
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
    // else if(geometry3 != null)
    // {
    //     var multipolygon = geometry3.split(';');
    //     for(var j=0; j < multipolygon.length; j++) {
    //         coordinates = multipolygon[j].split(" ");
    //         var templatlngs = new Array();
    //         for(var k = 0; k < coordinates.length-1; k+=2) 
    //         {				
    //             templatlngs.push([coordinates[k], coordinates[k+1]]);				
    //         }
    //         latlngs.push(templatlngs);
    //     }
    // }
    //These geometries are 3d points, polylines, or polygons. We have to cut out elevation since leaflet only handles 2d in our current format.
    else if(geometry4 != null)
    {
        var coordinates = geometry4.split("<gml:posList>");
        coordinates = coordinates[1].split("</gml:posList>");
        coordinates = coordinates[0];
        coordinates = coordinates.split(" ");
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

function remakeGeo(bindings)
{
    var ftypeName;
    var latlngs = new Array();

    //first make a 2d array to hold the geometries.
    var holder = new Array(bindings.length/4);
    for (var i = 0; i < holder.length; i++){
        holder[i] = new Array(4);
    }
    
    //put all the geometries in the 2d array
    for(var i=0; i < bindings.length; i++) {
        uri = bindings[i].subject.value;
        geom = bindings[i].geom.value;
        geom = geom.split(".");
        geom = geom[3];
        subgeom = bindings[i].subgeom.value;
        subgeom = subgeom.split("_");
        subgeom = subgeom[subgeom.length-1];
        //set feature type name for the dataset
        if(i==1)
            ftypeName = uri.split("/");
        //console.log(geom);
        //console.log(holder[Number(geom)-1]);
        holder[Number(geom)-1][Number(subgeom)-1] = bindings[i].gml.value;
    }
    //recreate the geometries and publishthem.
    //console.log(holder);
    //console.log(holder.length);
   // console.log(holder[1].length);
    for(var i=0; i < holder.length; i++)
    {
        //console.log("i:"+i);
        
        for (var j = 0; j < holder[i].length; j++)
        {
            //console.log(holder[i].length);
            //console.log("j:"+j);
            gml = holder[i][j];
            coordinates = gml.split("<gml:posList>");
            coordinates = coordinates[1].split("</gml:posList>");
            coordinates = coordinates[0];
            coordinates = coordinates.split(" ");
            for(var k = 0; k < coordinates.length-1; k+=2) {
                latlngs.push([coordinates[k], coordinates[k+1]]);
            }
        }
        marker = new L.polygon(latlngs,{color: getColor(ftypeName[5])});
        marker.bindPopup(
                    "<p> <a href='#' onClick=\"additionalInformation_v2('TEMP');\">Additional Information</a><br>" 
                    );
                    //Add the marker to the map layer
                    grouping.addLayer(marker);
                    //Visualize the map layer
                    grouping.addTo(map);
        latlngs = new Array();
    }

    
    return;
}

//Function to get additional information for a given entity
function additionalInformation_v2(URI)
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
                            "<b>" + bindings[i].property.value + ": &nbsp; </b> <a href='#' onClick=\"IRISearch_v2('"+
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