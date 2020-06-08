// Matthew Wagner & Tanner Fry
// mewagner@contractor.usgs.gov & tfry@contractor.usgs.gov
// Advanced Feature Description/Query builder functions for RDF processing operations.

var noFeatures = false;

// load the namespace IDs json from URL
var nsids = {};
$.getJSON('./afd/afd-nsids.json', function(data) { nsids = data; });

/* Lookup a namespace identifier based on dataset name of the feature.
 *
 * Inputs:
 *
 *   datasetName - The name of the dataset used to create map layer. 
 *                 For example, in the AFD Prototype, the GNIS dataset name is 'GNIS_DC_Features_20180401'.
 * 
 * Outputs:
 *
 *   nsID - The portion of the URI path that will identify which namespace 
 *          to use to construct the feature's URI in the hosted Marmotta server.
 *	    For example, the nsID for the dataset 'GNIS_DC_Features_20180401' = 'gnis'.
 */
function getNsId(datasetName) {

    // find dataset name and return its namespace ID
    for (var ds in nsids)
      if (ds == datasetName)
        return nsids[ds];

    // dataset not found  
    return null;
}

/*
 * Aggregate additional attributes of given feature via Marmotta.
 */
function getAdvFtrDesc(datasetName, uri) {
    noFeatures = false;
    // first clear tabs/data from previous features displayed
    $('#afd-tabs ul li').remove();
    $('#afd-tabs div').remove();
    $("#afd-tabs").tabs("refresh");

    // build feature's uri in marmotta
    //var uri = FEATURE_BASE_URL + getNsId(datasetName) + fid;

    // TEST URIs
    //uri = "http://data.usgs.gov/gnis/GNIS_DC_Features_20180401.1";
    //uri = "http://data.usgs.gov/structures/usgs_structures.52";

    /*
    * find corefs that link **TO** this uri
    */
    var query1 = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
        'SELECT DISTINCT ?coref ?dsuri ' +
        'WHERE ' +
        '{ ' +
        '  { GRAPH ?dsuri ' +
            '    { ?coref owl:sameAs <' + uri + '> . } ' +
        '  } ' +
        '}';

    query1 = encodeURIComponent(query1);
    executeAFDQuery(uri, query1, true, datasetName);

    /*
    * find corefs that have links **FROM** this uri
    */
    var query2 = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
        'SELECT DISTINCT ?coref ?dsuri ' +
        'WHERE ' +
        '{ ' +
        '  { GRAPH ?dsuri ' +
            '    { <' + uri + '> owl:sameAs ?coref . }' +
            '  } ' +
        '}';

    query2 = encodeURIComponent(query2);
    executeAFDQuery(uri, query2, false, datasetName);
    
    // Display/Update the afd tab section after everything is created
	displayUpdateAFDWidget();
}

function executeAFDQuery(uri, query, useSrcName, datasetName) {

   // create full HTTP GET request URL
   var http_get = MARMOTTA_SPARQL_URL + query;
   
   // execute sparql query in marmotta
   $.get({url: http_get, 
	   success: function(result) {
	   	// if NO RESULTS, then just dereference feature URI
		if(!result) {
            notification_manager.addToNotificationQueue("Warning", "No results after executing AFD Query.");
		    // FIXME this should probably be handled as an error; query should at least return results json with 0 bindings unless error occurs
		    getFtrDescByUri(uri, datasetName, useSrcName);
		}
		// if RESULTS, then dereference each one AND follow sameAs link out 1 node
		else {
		    bindings = result.results.bindings;
		    if(bindings.length > 0) {
			// deref each coref and follow sameAs link
				for(var i=0; i < bindings.length; i++) {
					coref = bindings[i].coref.value;
					dsuri = bindings[i].dsuri.value;
					
					// deref uri
					getFtrDescByUri(coref,dsuri, useSrcName);
					// see if uri has any of its own sameAs links
					followSameAsLink(coref, uri, datasetName);
				}
		    }
		    else { // no corefs, so just deref single feature URI
			if(noFeatures)
                notification_manager.addToNotificationQueue("Warning", "No advanced feature descriptions available.");
			
			noFeatures = true;
			//getFtrDescByUri(uri, datasetName, useSrcName);
		    }
		}
   }
   });



}

function followSameAsLink(uri, filterUri, datasetName) {

    /*
     * find corefs that link **TO** this uri
     */
    var query1 = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
	   'SELECT DISTINCT ?coref ?dsuri ' +
	   'WHERE ' +
	   '{ ' +
  	   '  { GRAPH ?dsuri ' +
    	   '    { ?coref owl:sameAs <' + uri + '> . } ' +
  	   '  } ' +
	   '  FILTER( ?coref != <' + filterUri + '> ) . ' +
	   '}';

    query1 = encodeURIComponent(query1);
    followSameAsLinkQuery(uri, query1, true, datasetName);

    /*
     * find corefs that have links **FROM** this uri
     */
     var query2 = 'PREFIX owl: <http://www.w3.org/2002/07/owl#> ' +
	   'SELECT DISTINCT ?coref ?dsuri ' +
	   'WHERE ' +
	   '{ ' +
  	   '  { GRAPH ?dsuri ' +
    	   '    { <' + uri + '> owl:sameAs ?coref . }' +
    	   '  } ' +
	   '  FILTER( ?coref != <' + filterUri + '> ) . ' +
	   '}';

    query2 = encodeURIComponent(query2);
    followSameAsLinkQuery(uri, query2, false, datasetName);
    
}

function followSameAsLinkQuery(uri, query, useSrcName, datasetName) {

    // create full HTTP GET request URL
    var http_get = MARMOTTA_SPARQL_URL + query;

    // execute sparql query in marmotta
    $.get({url: http_get, 
	   success: function(result, uri) {
	   	// if NO RESULTS, then just dereference feature URI
		if(!result) {
		    // FIXME this should probably be handled as an error; query should at least return results json with 0 bindings unless error occurs
		    getFtrDescByUri(uri,datasetName,useSrcName);
			
		}
		// if RESULTS, then dereference each one
		else {
		    bindings = result.results.bindings;
		    if(bindings.length > 0) {
			// deref each coref
			for(var i=0; i < bindings.length; i++) {
			    coref = bindings[i].coref.value;
			    dsuri = bindings[i].dsuri.value;
			    getFtrDescByUri(coref,dsuri,useSrcName);
			}
		    }
		    else { // no corefs, so just deref single feature URI
			
			//getFtrDescByUri(uri,datasetName,useSrcName);
		    }
		}
   }});


}

/*
 * Retrieve attributes of feature from Marmotta and display in advanced feature description div.
 */
function getFtrDescByUri(uri, dsuri, useSrcName) {

   // strip "SOURCE-TARGET" dataset name off end of uri
   var srcTgtName = dsuri.substring(dsuri.lastIndexOf("/")+1);

   // to use source name, get substring BEFORE hyphen
   // to use target name, get substring AFTER hyphen
   var hyphenPos = srcTgtName.lastIndexOf("-");
   var dsname = useSrcName ? srcTgtName.substring(0,hyphenPos) : srcTgtName.substring(hyphenPos+1);

   // url encode the uri after question mark char
   var urlEncoded = encodeURIComponent(uri);

   // make the http request to deref the data
   $.get({url: MARMOTTA_DEREF_URL + urlEncoded, success: function(result) {
	// create results html from sparql select json results and render as a new AFD tab in UI
	if(result) {
        var attsHtml = buildFeatureHtml(result);
	    createTab(dsname, attsHtml);
	}
	else { // NO RESULTS! render as a new tab in UI and state couldn't load results
        notification_manager.addToNotificationQueue("Warning", "No results for dereference URI: " + uri + ".");
	    createTab(dsname,'<b>Unable to retrieve attributes of feature.</b>');
	}
   }});

}

/*
 * Build html to render in AFD tab
 */
function buildFeatureHtml(resultRecs) {

    var html = '';

    /* 
     * outer loop: loop over each record in results
     */
    for(var i=0; i < resultRecs.length; i++) {

	    // get attribute/values for record
	    atts = resultRecs[i]['@graph'][0];

	    var idx = -1;

	    /*
	     * inner loop: loop over each attribute/value in record
	     */

	    // parse the json-ld to get attributes + values
	    for(var attUri in atts) {
		var att = '';
		var value = atts[attUri][0]['@value']; // get literal value
		if(!value) { // get uri vs. literal
		    value = atts[attUri][0]['@id'];
		    // val should be a uri, so strip off namespace
		    if(value) {
			idx = value.lastIndexOf('#');
			if(idx < 0)
			    idx = value.lastIndexOf('/');
			if(idx > 0)
			    value = value.substring(idx+1);
		    }
		}

		// skip over feature ID or geometry coord string
		if(attUri == '@id')
		    continue;
		if(attUri.includes('asWKT'))
		    continue;
		// @type has to be handled sep from other atts
		if(attUri == '@type') {
		    att = 'type';
		    value = atts[attUri][0];
		    // val should be a uri, so strip off namespace
		    idx = value.lastIndexOf('#');
		    if(idx < 0)
			idx = value.lastIndexOf('/');
		    if(idx > 0)
			value = value.substring(idx+1);
		}
		else { 
		    // get attribute name (right of slash or hash in uri)
		    idx = attUri.lastIndexOf('#');
		    if(idx < 0)
			idx = attUri.lastIndexOf('/');
		    att = attUri.substring(idx+1);
		}

		// clean up any null literals if present
		if(value == 'null')
		    value = '';
		// append attribute and value to the html
		html += '<b>' + att + ': &nbsp; </b>' + value + '<br>'; 
	    }
    }
    
    return html;
}

function createTab(name, content) {
    // A function that creates a tab inside the qb-widget/afd-widget so that information
    // can be propagated into the tab from other function calls at a later date.
    // Construct popup container 
    var HTML = '';
    if(name == 'Query Builder') {
        HTML += '<div class="qb-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.qb-widget').append(HTML);
    } else if(name == 'AFD') {
        $('.afd-widget').empty();
        HTML += '<button class="close" type="button" onclick="closeAFDWidget();"><span aria-hidden="true" class="btn-widget-exit" id="afd-btn-widget-exit"><a href="#">&times;</a></span></button>'
                + '<span class="afd-widget-title">Advanced Feature Description</span>'
                + '<hr/>'
        HTML += '<div class="afd-widget-tab afd-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.afd-widget').append(HTML);
	} else if(name == 'Pre-Built Queries') {
		HTML += '<div class="qb-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.preb-widget').append(HTML);
	}
	else if(name == 'Wikidata') {
		HTML += '<div class="wkd-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.wkd-widget').append(HTML);
	}
	else if(name == 'DBPedia') {
		HTML += '<div class="dbp-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.dbp-widget').append(HTML);
	}
	else if(name == 'Publications') {
		HTML += '<div class="pub-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.pub-widget').append(HTML);
	}
	else if(name == 'Metadata') {
		HTML += '<div class="meta-widget-tab qb-content-container" id="tabs-' + current_custom_queries + '"></div>';
        $('.meta-widget').append(HTML);
	}
	else {
        $('.afd-widget').empty();
        HTML += '<button class="close" type="button" onclick="closeAFDWidget();"><span aria-hidden="true" class="btn-widget-exit" id="afd-btn-widget-exit"><a href="#">&times;</a></span></button>'
                + '<span class="afd-widget-title">Advanced Feature Description</span>'
                + '<hr/>'
        HTML += '<div class="afd-widget-tab afd-content-container" id="tabs-' + current_custom_queries + '">' + content + '</div>';
        $('.afd-widget').append(HTML);
    }
}