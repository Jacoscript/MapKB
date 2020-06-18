/*
* The MARMOTTA_IP variable maintains the current IP address of your marmotta and postgres server so that 
* the UI can connect to the correct endpoint. This should be updated anytime the projected is moved to a 
* new machine.
*/
var MARMOTTA_IP = '144.47.161.52:8080';

/*
* These variables are describe the rest endpoints for marmotta.
*/
//var MARMOTTA_BASE_URL = 'http://'+MARMOTTA_IP+'/marmotta';
var MARMOTTA_BASE_URL = '/marmotta';
var MARMOTTA_DEREF_URL = MARMOTTA_BASE_URL + '/meta/application/ld+json?uri=';
var MARMOTTA_SPARQL_URL = MARMOTTA_BASE_URL + '/sparql/select?output=json&query=';
var FEATURE_BASE_URL = 'http://data.usgs.gov/';

/*
* These variables describe the sparql endpoint for DBpedia. 
*/
var DBPEDIA_BASE_URL = 'https://dbpedia.org';
var DBPEDIA_SPARQL_URL =  DBPEDIA_BASE_URL + '/sparql/select?output=json&query=';

/*
* These variables describe the sparql endpoint for Wikidata. 
*/
var WIKIDATA_BASE_URL = 'https://query.wikidata.org/bigdata/namespace/wdq';
var WIKIDATA_SPARQL_URL =  WIKIDATA_BASE_URL + '/sparql?format=json&query=';

/*
* These variables describe the rest endpoint for Publications. 
*/
var PUBLICATIONS_BASE_URL = 'https://pubs.er.usgs.gov/pubs-services/publication';
var PUBLICATIONS_REST_URL =  PUBLICATIONS_BASE_URL + '/?mimeType=json&page_size=10&title=';


/*
* This is the variable used to determine the location your geoserver instance.
*/
var WFS_BASE_URL = 'http://144.47.161.52:8080/geoserver/wfs';