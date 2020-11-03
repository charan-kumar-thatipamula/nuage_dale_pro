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
    if (!options.responseData || options.responseData.length == 0) {
        return options.responseData;
    }
    for (var i=0;i<options.responseData.length;i++) {
        var res = options.responseData[i];
        var id = res.id;
        if (!id) {
            continue;
        }

        var record = nlapiLoadRecord('inventoryitem', id);
        record.setLineItemMatrixValue('price', 'price', 1, 1, record.getFieldValue("custitem_baseprice_store"));
        record.setLineItemMatrixValue('price', 'price', 2, 1, record.getFieldValue("custitem_listprice_store"));
        record.setLineItemMatrixValue('price', 'price', 3, 1, record.getFieldValue("custitem_network_store"));
        record.setLineItemMatrixValue('price', 'price', 4, 1, record.getFieldValue("custitem_network2_store"));
        record.setLineItemMatrixValue('price', 'price', 5, 1, record.getFieldValue("custitem_sheetcost_store"));
        record.setLineItemMatrixValue('price', 'price', 6, 1, record.getFieldValue("custitem_sella_store"));
        record.setLineItemMatrixValue('price', 'price', 7, 1, record.getFieldValue("custitem_sellb_store"));
        record.setLineItemMatrixValue('price', 'price', 8, 1, record.getFieldValue("custitem_sellc_store"));
        record.setLineItemMatrixValue('price', 'price', 9, 1, record.getFieldValue("custitem_selld_store"));
        record.setLineItemMatrixValue('price', 'price', 10, 1, record.getFieldValue("custitem_selle_store"));
        record.setLineItemMatrixValue('price', 'price', 11, 1, record.getFieldValue("custitem_onlineprice_store"));

        var preferredStockLevel = record.getFieldValue('custitem_preferred_stock_level');
        var reorderPoint = record.getFieldValue('custitem_reorder_point');

        record.setLineItemValue('locations', 'preferredstocklevel', 3, preferredStockLevel);
        record.setLineItemValue('locations', 'reorderpoint', 3, preferredStockLevel);
        id = nlapiSubmitRecord(record);
        nlapiLogExecution('DEBUG', 'record saved in post submit', id);
    }
    return options.responseData
}