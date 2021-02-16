/*
* preMapFunction stub:
*
* The name of the function can be changed to anything you like.
*
* The function will be passed one ‘options’ argument that has the following fields:
*   ‘data’ - an array of records representing the page of data before it has been mapped.  A record can be an object {} or array [] depending on the data source.
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
*   'errors' -  used to report one or more errors for the specific record.  Each error must have the following structure: {code: '', message: '', source: ‘’ }
* Returning an empty object {} for a specific record will indicate that the record should be ignored.
* Returning both 'data' and 'errors' for a specific record will indicate that the record should be processed but errors should also be logged.
* Throwing an exception will fail the entire page of records.
*/
function preMap (options) {
    setValues(options);
    var preMapReturnObj = [];
    for(var i=0; i<options.data.length; i++){
        preMapReturnObj.push({
            data : options.data[i]
        });
    }
    return preMapReturnObj;
}

function setValues(options) {
    for(var i=0; i<options.data.length; i++){
        var record = options.data[i];
        if (!record) {
            continue;
        }
        var r = getBrand(record);
        if (!r || r.length == 0) {
            continue;
        }
        setVendorNameOrExternalId(record, r);
        setDescriptionFields(record, r);
    }
}

/**
    The description fields will concatenate two or three CSV fields and the results will be modified prior to updating Netsuite:

    1.  The string will be capitalized

    2.  With the exception of the DISPLAY NAME/CODE field, if the length of the concatenated string is greater than 99 characters, the value is truncated to 96 characters, and is concatenated with "..."

    3.  When setting the DISPLAY NAME/CODE field, if the length of the concatenated string is greater than 60 characters, the value is truncated to 57 characters, and is concatenated with "..."


    IF BRAND + PURCHASE DESCRIPTION (custrecordcust_rec_brnd_pdes) = FALSE, concatenate these elements:

    (Value for Brand in the CSV) + (space) + (Value for Item Part Name in the CSV) + (space) + (Value for Purchase Description in the CSV)


    IF BRAND + PURCHASE DESCRIPTION (custrecordcust_rec_brnd_pdes) = TRUE, concatenate these elements:

    (Value for Brand in the CSV) + (space) + (Value for Purchase Description in the CSV)

    Description Issue - the requirements doc outlines logic for creating descriptions for ADDITIONS.   
    This logic does not apply to existing records.  
    For adds and updates, the value in the CSV for Purchase Description should be capitalized and set in the Purchase Description field
  
 * @param {*} record : Export CSV record received from data loader
 * @param {*} brandRecord : Brand record searched based on 'Brand' value from export record
 */
function setDescriptionFields(record, brandRecord) {
    var brandPlusPurchaseDescription = brandRecord[0].getValue('custrecordcust_rec_brnd_pdes');
    var description = "";
    if (brandPlusPurchaseDescription == "F") {
        description = record["Brand"] + " " + record["Item Part Name"] + " " + record["Purchase Description"];
    }

    if (brandPlusPurchaseDescription == "T") {
        description = record["Brand"] + " " + record["Purchase Description"];
    }

    record["DisplayNameCodeIngested"] = applyTruncationRule(description, 60, 57);
    var truncatedValue = applyTruncationRule(description, 99, 96);
    record["SalesDescriptionIngested"] = truncatedValue;
    record["PageTitleIngested"] = truncatedValue;
    record["WebStoreDisplayNameIngested"] = truncatedValue;
    record["WebStoreDescriptionIngested"] = truncatedValue;
}

function applyTruncationRule(value, maxLength, lenghtToLimit) {
    if (!value) {
        return value;
    }
    value = value.toUpperCase();
    if (value.length > maxLength) {
        value = value.substr(0, lenghtToLimit).concat("...");
    }

    return value;
}

/**
    VENDOR NAME/CODE (vendorname) - refer to the logic below:

    Refer to the value in the CSV for Brand and lookup the matching value in the custom record type "Brand" (customrecord25).  Look up the following field:

    Vendor Code Character Removal (custrecordcust_vndr_code_charcter_rmvl)

    IF Vendor Code Character Removal (custrecordcust_vndr_code_charcter_rmvl) = TRUE, all non-alphanumeric characters (spaces, dashes, asterix, equal sign, forward slash, backward slash, etc..) are removed prior to updating the field.

    Example 1:

    CSV value for Item Part Name = NC4MX/MX-15CQ
    CSV value for Brand = REDCO
    Vendor Code Character Removal = TRUE

    Vendor Name/Code Value is set to = NC4MXMX15CQ

    Example 2:

    CSV value for Item Part Name = NC4MX/MX-15CQ
    CSV value for Brand = REDCO
    Vendor Code Character Removal = FALSE

    Vendor Name/Code Value is set to = NC4MX/MX-15CQ
 */
function setVendorNameOrExternalId(record, r) {
    var vendorCodeCharRemove = r[0].getValue('custrecordcust_vndr_code_charcter_rmvl');
    var prefix = r[0].getValue('custrecordcust_record_prefix');
    var itemName = record["Item Part Name"];
    if (vendorCodeCharRemove == "T") {
        itemName = itemName.replace(/[^A-Za-z0-9+]/gmi, "").replace(/\s+/g, "");
    }
    var externalId = prefix + "-" + itemName; 
    record["VendorName"] = itemName.toUpperCase();
    record["ExternalId"] = externalId.toUpperCase();
    record["Prefix"] = prefix.toUpperCase();
}

function getBrand(record) {
    if (!record) {
        return;
    }

    var r = nlapiSearchRecord('customrecord25', null, 
    ["name", "is", record["Brand"]], 
    [new nlobjSearchColumn('custrecordcust_record_prefix'), new nlobjSearchColumn('custrecordcust_vndr_code_charcter_rmvl'), new nlobjSearchColumn('custrecordcust_rec_brnd_pdes')]);
    return r;
}