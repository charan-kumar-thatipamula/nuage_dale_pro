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
    return r.Brand &&
              r["Item Part Name"] &&
              r["Price List Date"] &&
              r["LIST PRICE"] &&
              r.SHEETCST &&
              (r.SHEETCST <= r["MAP Price"])&&
              (r.SHEETCST <= r["LIST PRICE"])&&
              (r["MAP Price"] <= r["LIST PRICE"])&&
              (r["LIST PRICE"] <= (r.SHEETCST * 12));
}




