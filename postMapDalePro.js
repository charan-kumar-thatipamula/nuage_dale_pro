/*
* postMapFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one argument ‘options’ that has the following fields:
*   ‘preMapData’ - an array of records representing the page of data before it was mapped.  A record can be an object {} or array [] depending on the data source.
*   ‘postMapData’ - an array of records representing the page of data after it was mapped.  A record can be an object {} or array [] depending on the data source.
*   '_importId' - the _importId currently running.
*   '_connectionId' - the _connectionId currently running.
*   '_flowId' - the _flowId currently running.
*   '_integrationId' - the _integrationId currently running.
*   'settings' - all custom settings in scope for the import currently running.
*
* The function needs to return an array, and the length MUST match the options.data array length.
* Each element in the array represents the actions that should be taken on the record at that index.
* Each element in the array should have the following fields:
*   'data' - the modified/unmodified record that should be passed along for processing.
*   'errors' - used to report one or more errors for the specific record.  Each error must have the following structure: {code: '', message: '', source: ‘’ }
* Returning an empty object {} for a specific record will indicate that the record should be ignored.
* Returning both 'data' and 'errors' for a specific record will indicate that the record should be processed but errors should also be logged.
* Throwing an exception will fail the entire page of records.
*/
function postMap (options) {
    setValues(options);
    var postMapReturnObj = [];
    for(var i=0; i<options.postMapData.length; i++){
        postMapReturnObj.push({
            data : options.postMapData[i]
        });
    }
    return postMapReturnObj;
}

function setValues(options) {
    for(var i=0; i<options.postMapData.length; i++){
        var record = options.postMapData[i];
        if (!record) {
            continue;
        }
        preferredStockLevelMapping(record);
        reorderPointMapping(record);
    }
}

function preferredStockLevelMapping(record) {
    var pStockLevel = record["custitem_preferred_stock_level"];
    if (record.internalId || record.id) {
        if (!pStockLevel || pStockLevel.length == 0) {
            delete record["custitem_preferred_stock_level"];
        }
    }

    if (!record.internalId && !record.id) {
        record["custitem_preferred_stock_level"] = (!pStockLevel || pStockLevel.length == 0) ? 0 : pStockLevel;
    }
}

function reorderPointMapping(record) {
    var reorderPoint = record["custitem_reorder_point"];
    if (record.internalId || record.id) {
        if (!reorderPoint || reorderPoint.length == 0) {
            delete record["custitem_reorder_point"];
        }
    }

    if (!record.internalId && !record.id) {
        record["custitem_reorder_point"] = (!reorderPoint || reorderPoint.length == 0) ? 0 : reorderPoint;
    }
}
