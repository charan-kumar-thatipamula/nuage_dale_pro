/*
* postSubmitFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields:
*  ‘preMapData’ - an array of records representing the page of data before it was mapped.  A record can be an object {} or array [] depending on the data source.
*  ‘postMapData’ - an array of records representing the page of data after it was mapped.  A record can be an object {} or array [] depending on the data source.
*  ‘responseData’ - an array of responses for the page of data that was submitted to the import application.  An individual response will have the following fields:
*    ‘statusCode’ - 200 is a success.  422 is a data error.  403 means the connection went offline.
*    ‘errors’ - [{code: '', message: '', source: ‘’}]
*    ‘ignored’ - true if the record was filtered/skipped, false otherwise.
*    ‘id’ - the id from the import application response.
*    ‘_json’ - the complete response data from the import application.
*    ‘dataURI’ - if possible, a URI for the data in the import application (populated only for errored records).
*  '_importId' - the _importId currently running.
*  '_connectionId' - the _connectionId currently running.
*  '_flowId' - the _flowId currently running.
*  '_integrationId' - the _integrationId currently running.
*  'settings' - all custom settings in scope for the import currently running.
*
* The function needs to return the responseData array provided by options.responseData. The length of the responseData array MUST remain unchanged.  Elements within the responseData array can be modified to enhance error messages, modify the complete _json response data, etc...
* Throwing an exception will fail the entire page of records.
*/
function postSubmit (options) {
    var resData = options.responseData;
    for (var i=0;i<resData.length;i++) {
        ignoredRecords(resData, i);
    }
    return options.responseData
}

function ignoredRecords(resData, i) {
    var record = resData[i];
    if (record.ignored == true) {
        record.ignored = false;
        record.statusCode = 422;
    } else {
        return;
    }
    var msg = "";

    if (record.id) {
        msg = "Record already exists: " + record.id;
    } else {
        msg = "Ignored the record at row: [" + (i+1) + "]";
    }
    record.errors = [
        {
            code: "IGNORED",
            message: msg
        }
    ];
}

