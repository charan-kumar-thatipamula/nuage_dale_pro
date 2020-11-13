/**
 skip if:
 
 Brand is EMPTY

 Item Part Name is EMPTY

 Price List Date is EMPTY

 LIST PRICE is EMPTY

 SHEETCST is EMPTY

 SHEETCST is greater than MAP Price

 SHEETCST is greater than LIST PRICE

 MAP Price is greater than LIST PRICE

 LIST PRICE is greater than SHEETCST ( x 12 )
*/

function exportFilter(options) {
    if (!options) {
      return false;
    }
    var r = options.record;
    if(!r) {
      return false;
    }
    var shouldProcess = r.Brand &&
              r["Item Part Name"] &&
              r["Price List Date"] &&
              r["LIST PRICE"] &&
              r.SHEETCST &&
              (getFloatValue(r.SHEETCST) <= getFloatValue(r["MAP Price"]))&&
              (getFloatValue(r.SHEETCST) <= getFloatValue(r["LIST PRICE"]))&&
              (getFloatValue(r["MAP Price"]) <= getFloatValue(r["LIST PRICE"]))&&
              (getFloatValue(r["LIST PRICE"]) <= getFloatValue((r.SHEETCST * 12)));
    if (shouldProcess == true) {
      return shouldProcess;
    }
    var errorMessage = "";
    var brand = "";
    var itemPartName = "";
    if (!r.Brand) {
      errorMessage = "['Brand' should not be empty] "
    } else {
      brand = r.Brand;
    }

    if (!r["Item Part Name"]) {
      errorMessage += "['Item Part Name' should not be emtpty] ";
    } else {
      itemPartName = r["Item Part Name"];
    }

    if (!r["Price List Date"]) {
      errorMessage += "['Item Part Name' should not be emtpty] ";      
    }

    if (!r["LIST PRICE"]) {
      errorMessage += "['LIST PRICE' should not be emtpty] ";      
    }

    if (!r.SHEETCST) {
      errorMessage += "['SHEETCST' should not be emtpty] ";      
    }

    if (!(getFloatValue(r.SHEETCST) <= getFloatValue(r["MAP Price"]))) {
      errorMessage += "['SHEETCST' (" + r.SHEETCST + ") should be less than or equal to 'Map Price' (" + r["MAP Price"] + ")] " + shouldProcess;      
    }

    if (!(getFloatValue(r["MAP Price"]) <= getFloatValue(r["LIST PRICE"]))) {
      errorMessage += "['Map Price' (" + r["MAP Price"] + ") should be less than or equal to 'LIST PRICE' (" + r["LIST PRICE"] + ")] ";      
    }

    if (!(getFloatValue(r.SHEETCST) <= getFloatValue(r["LIST PRICE"]))) {
      errorMessage += "['SHEETCST' (" + r["SHEETCST"] + ") should be less than or equal to 'LIST PRICE' (" + r["LIST PRICE"] + ")] ";      
    }

    if (!(getFloatValue(r["LIST PRICE"]) <= getFloatValue((r.SHEETCST * 12)))) {
      errorMessage += "['LIST PRICE' (" + r["LIST PRICE"] + ") should be less than or equal to SHEETCST * 12 (" + (r["SHEETCST"] * 12 )+ ")] ";      
    }
    var msgPrefix = "";
    if (r.Brand) {
      msgPrefix = "Error for record with 'Brand': " + r.Brand;
    }

    if (r["Item Part Name"]) {
      if (msgPrefix) {
        msgPrefix += " and 'Item Part Name': " + r["Item Part Name"] + " ";
      } else {
        msgPrefix = "Error for record with 'Item Part Name': " + r["Item Part Name"] + " ";
      }
    }
    throw msgPrefix + "Error(s): " + errorMessage;
}

function getFloatValue(inputValue) {
  return (typeof inputValue == "string") ? parseFloat(inputValue) : inputValue;
}