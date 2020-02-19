// Tanner Fry
// tfry@contractor.usgs.gov
// This script is used for handling basic information and other misc issues.

function checkUserDevice() {
    if(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

function performBasicDeviceCheck() {
    if (checkUserDevice() == true) {
        alert('Mobile device detected.');
    } else {
        alert('Browser device detected.')
    }
}

function testQuery() {
    // Get query and encode it
    // TODO: Ask Matthew why the below PREFIX doesn't work
    var query = `
    PREFIX feat: <http://www.opengis.net/ont/geosparql#Feature>

    SELECT DISTINCT ?predicate ?publisher
    
    WHERE {
        ?s ?predicate ?o .
        ?s <http://purl.org/dc/terms/publisher> ?publisher
    }`
    query = encodeURIComponent(query);

    //Get the http request url.
    var httpGet = MARMOTTA_SPARQL_URL + query;
    // execute sparql query in marmotta
		$.get({url: httpGet, 
			success: function(result) {
				//if no results, throw an error
				if(!result) {
					alert("No results while creating additional information.");
				}
				else {
				    bindings = result.results.bindings;
					//go through all of the results. If 0 items, throw an error
					if(bindings.length > 0) {
                        //go through all of the results and add them to the tab.
                        var tmp = '';
						for(var i = 0; i < bindings.length; i++) {
                            tmp += bindings[i].predicate.value + '\n';
                        }
                        //alert(tmp);
					}
					else { //There was no results so do nothing.
						alert("No results for bindings while creating additional information.");
					}
				}
			},
			error: function(result) {
				alert("Creating query failed.");
			}
		});
}

$(document).ready(function() {
    // Perform basic checks against new user
    // TODO: Wait for Dalia's phone so we can test that a basic version works.
    // performBasicDeviceCheck();
    
    //testQuery();
});