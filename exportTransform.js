
function transform(options) {
    if (!options) {
        return options;
    } 
    var record = options.record;
    if (!record) {
        return record;
    }
    setPurchaseDescription(record);
    setItemPartNumber(record);
    setLandCSTPercentage(record);
    setLBVMarkupPercentage(record);
    setUniLateralPrice(record);
    setDaleDiscount(record);
    setDaleDiscount2(record);
    setPurchasePriceAndDaleCSTFields(record);
    setLandCSTAndLandCSTBaseValueFields(record);
    setMapPrice(record);
    applyGeneralPricingRules(record);
    setDummyExternalId(record);
    return options.record;
}

/**
    Modifications:

    1.  The value in the CSV is capitalized

    2.  If the length of the value in the CSV is greater than 99 characters, the value is truncated to 96 characters, and is concatenated with "..."
 */

function setPurchaseDescription(record) {
    var purchaseDescription = record["Purchase Description"];
    if (purchaseDescription) {
        purchaseDescription = purchaseDescription.toUpperCase();
        if (purchaseDescription.length > 99) {
            purchaseDescription = purchaseDescription.substr(0, 96).concat("...");
        }
    }
    record["Purchase Description"] = purchaseDescription;
}

/**
    ITEM PART NUMBER (custitemcust_item_part_nmbr) IF the value in the CSV for Item Part Number is EMPTY.
 */

function setItemPartNumber(record) {
    record["ItemPartNumber"] = 
        !record["Item Part Number"] 
            ? record["Item Part Name"] 
            : record["Item Part Number"];
}
/**
    LANDCST PERCENTAGE (custitemcust_item_landcst_multiplier)

    If the value in the CSV for LandCST Percentage is EMPTY and the value in the CSV for SHEETCST is less than $2999.99, the value for LANDCST PERCENTAGE (custitemcust_item_landcst_multiplier) is set to "2"

    If the value in the CSV for LandCST Percentage is EMPTY and the value in the CSV for SHEETCST is greater than $2999.99, the value for LANDCST PERCENTAGE (custitemcust_item_landcst_multiplier) is set to "1"
 */
function setLandCSTPercentage(record) {
    var landCSTPercentage = record["LandCST Percentage"];
    var sheetCST = getFloatValue(record.SHEETCST);
    var sheetCSTLimit = 2999.99;
    // what if sheetCST == 2999.99??
    if (!landCSTPercentage) {
        if (sheetCST < sheetCSTLimit) {
            record["LandCST Percentage"] = 2;
        }

        if (sheetCST > sheetCSTLimit) {
            record["LandCST Percentage"] = 1;
        } 
    }
}

/**
    LBV MARKUP PERCENTAGE (custitemcust_item_lbv_markup)

    If the value in the CSV for LBV Markup Percentage is EMPTY, the field LBV MARKUP PERCENTAGE (custitemcust_item_lbv_markup) is set to "0"
 */
function setLBVMarkupPercentage(record) {
    var lbvMarkupPercentage = record["LBV Markup Percentage"];
    if (!lbvMarkupPercentage) {
        record["LBV Markup Percentage"] = 0;
    }
}

/**
    UNILATERAL PRICE (custitemcust_item_unilateral_price)

    If the value in the CSV for Unilateral Price is EMPTY, the value updated into the field UNILATERAL PRICE (custitemcust_item_unilateral_price) = FALSE
*/
function setUniLateralPrice(record) {
    var uniLateralPrice = record["Unilateral Price"];
    if (!uniLateralPrice) {
        record["Unilateral Price"] = "FALSE";
    }
}

/**
    DALE DISCOUNT (custitemcust_item_dale_discount)

    If the value in the CSV for DALE DISCOUNT is EMPTY, the field DALE DISCOUNT (custitemcust_item_dale_discount) is set to "0"
 */

function setDaleDiscount(record) {
    var daleDiscount = record["DALE DISCOUNT"];
    if (!daleDiscount) {
        record["DALE DISCOUNT"] = 0;
    }
}

/**
    DALE DISCOUNT 2 (custitemcust_item_dale_discount_2)

    If the value in the CSV for DALE DISCOUNT 2 is EMPTY, the field DALE DISCOUNT 2 (custitemcust_item_dale_discount_2) is set to "0"
 */

function setDaleDiscount2(record) {
    var daleDiscount2 = record["DALE DISCOUNT 2"];
    if (!daleDiscount2) {
        record["DALE DISCOUNT 2"] = 0;
    }
}

/**
 * 
    The fields PURCHASE PRICE (cost) and DALECST (custitemcust_dpa_cost) are calculated as follows using the values found in the CSV:

    SHEETCST ( x ) {{1 - (DALE DISCOUNT/100) ( x ) 1 - (DALE DISCOUNT 2/100)}}

    Example 1:

    SHEETCST = $100
    DALE DISCOUNT = 5
    DALE DISCOUNT 2 = 0

    100 (x) {{1 - (5/100) ( x ) 1 - (0/100)}} = 95

    Example 2:

    SHEETCST = $100
    DALE DISCOUNT = 10
    DALE DISCOUNT 2 = 5

    100 ( x ) {{1 - (10/100) ( x ) 1 - (5/100)}} = 85.5
 */
function setPurchasePriceAndDaleCSTFields(record) {
    var sheetCST = getFloatValue(record.SHEETCST);
    var daleDiscount = getFloatValue(record["DALE DISCOUNT"]);
    var daleDiscount2 = getFloatValue(record["DALE DISCOUNT 2"]);

    var calculatedValue = sheetCST * ((1-(daleDiscount/100)) * (1-(daleDiscount2/100)));
    record["PurchasePriceIngested"] = calculatedValue;
    record["DaleCSTIngested"] = calculatedValue;
}

/**
    For adds and updates, the fields LANDCST (custitemcust_landed_cost) and LANDCST BASE VALUE (custitemcust_item_landcstbaseunitvalue) 
    are set based on the calculated value for PURCHASE PRICE (cost) as well as the values for SHEETCST and LandedCST Percentage in the CSV:

    If the value in the CSV for SHEETCST is less than $3000, and the value in the CSV for LandCST Percentage is EMPTY:

    Calculated value for PURCHASE PRICE ( x ) 1.02

    If the value in the CSV for SHEETCST is greater than $3000, and the value in the CSV for LandCST Percentage is EMPTY:

    Calculated value for PURCHASE PRICE ( x ) 1.01

    If there is a value in the CSV for LandCST Percentage:

    Calculated value for PURCHASE PRICE ( x ) {{value in LandCST Percentage/100 + 1}}

    Examples:

    Calculated Value for PURCHASE PRICE: $95
    SHEETCST = $100
    Value in LandCST Percentage = EMPTY

    $95 (x) 1.02 = $96.90

    Calculated Value for PURCHASE PRICE: $4000
    SHEETCST = $4000
    Value in LandCST Percentage = EMPTY

    $4000 (x) 1.01 = 4040

    Calculated Value for PURCHASE PRICE: $95
    SHEETCST = $100
    Value in LandCST Percentage = 10

    $95 (x) 1.10 = $104.50
 */
function setLandCSTAndLandCSTBaseValueFields(record) {
    var landCSTPercentage = record["LandCST Percentage"];
    var sheetCST = getFloatValue(record.SHEETCST);
    var sheetCSTLimit = 3000;
    var purchasePrice = record["PurchasePriceIngested"];
    if (!landCSTPercentage) {

        // What if sheetCST == sheetCSTLimit??
        if (sheetCST < sheetCSTLimit) {
            record["LandCST"] = purchasePrice * 1.02;
            record["LandCSTBaseValue"] = purchasePrice * 1.02;
        }

        if (sheetCST > sheetCSTLimit) {
            record["LandCST"] = purchasePrice * 1.01;
            record["LandCSTBaseValue"] = purchasePrice * 1.01;
        }
    } else {
        landCSTPercentage = getFloatValue(record["LandCST Percentage"]);
        record["LandCST"] = purchasePrice * ((landCSTPercentage/100) + 1);
        record["LandCSTBaseValue"] = purchasePrice * ((landCSTPercentage/100) + 1);
    }
}

/**
    MAP PRICE (custitemcust_item_map_price)

    STARTING PRICE (custitemstarting_price)

    BUYITNOW PRICE (custitembuyitnow_price)

    Celigoprice :  : Base Price : Tier 0 Amount

    Celigoprice :  : Online Price : Tier 0 Amount

    (I believe this is the correct mapping in the Data Loader)

    If the value in the CSV for MAP Price is EMPTY, the value for the field MAP PRICE (custitemcust_item_map_price) is set to "null"

    If the value in the CSV for MAP Price is EMPTY, the value for the following fields is set to the calculated value for Price Level Sell A:

    STARTING PRICE (custitemstarting_price)

    BUYITNOW PRICE (custitembuyitnow_price)

    Celigoprice :  : Base Price : Tier 0 Amount

    Celigoprice :  : Online Price : Tier 0 Amount


    To calculate the value for Price Level Sell A, it is necessary to reference the calculated value for LANDCST, as well as the values in the CSV for LIST PRICE, LBV Markup Percentage, and Price Level A Percentage.

    Example 1 with sample CSV values:

    LIST PRICE = $249
    MAP Price = EMPTY
    LBV Markup Percentage = EMPTY
    Price Level A Percentage = .7
    Calculated value for LANDCST = $153

    Here's the math to calculate the value for Price Level Sell A:

    {{(Calculated value for LANDCST) x {1 + LBV Markup Percentage/100} / Price Level A Percentage }}

    {{($153)  x  {1 + 0/100} / .7}} = $218.57.  With the rounding rules outlined in A31 the value to update would be $219.

    Example 2 with sample CSV values:

    LIST PRICE = $59
    MAP Price = EMPTY
    LBV Markup Percentage = EMPTY
    Price Level A Percentage = EMPTY (when empty the value for calcuations is .72)
    Calculated value for LANDCST = $35.7

    Here's the math to calculate the value for Price Level Sell A:

    {{(Calculated value for LANDCST) x {1 + LBV Markup Percentage/100} / Price Level A Percentage }}

    {{($35.7)  x  {1 + 0/100} / .72}} = $49.58.  With the rounding rules outlined in A31 the value to update would be $49.50.


    Example 3 with sample CSV values:

    LIST PRICE = $21.99
    MAP Price = EMPTY
    LBV Markup Percentage = 15
    Price Level A Percentage = EMPTY (when empty the value for calcuations is .72)
    Calculated value for LANDCST = $10.20

    Here's the math to calculate the value for Price Level Sell A:

    {{(Calculated value for LANDCST) x {1 + LBV Markup Percentage/100} / Price Level A Percentage }}

    {{($10.2)  x  {1 + 15/100} / .72}} = $16.29.  With the rounding rules outlined in A31 the value to update would be $16.50.

    Example 4 with sample CSV values:

    LIST PRICE = $219.99
    MAP Price = EMPTY
    LBV Markup Percentage = EMPTY
    Price Level A Percentage = EMPTY (when empty the value for calcuations is .72)
    Calculated value for LANDCST = $178.50

    Here's the math to calculate the value for Price Level Sell A:

    {{(Calculated value for LANDCST) x {1 + LBV Markup Percentage/100} / Price Level A Percentage }}

    {{($178.50)  x  {1 + 0/100} / .72}} = $228.85.  With the general pricing rules outlined in A15 the value to update would be $219.99
 */

function setMapPrice(record) {
    var mapPrice = record["MAP Price"];
    var startingPrice = record["MAP Price"];
    var buyItNowPrice = record["MAP Price"];

    if (!mapPrice) {
        mapPrice = "null";
        var priceLevelSellA = getPriceLevelSellA(record);
        startingPrice = priceLevelSellA;
        buyItNowPrice = priceLevelSellA;
    }
    record["StartingPrice"] = startingPrice;
    record["BuyItNowPrice"] = buyItNowPrice;
}

function getPriceLevelSellA(record) {
    var listPrice = getFloatValue(record["LIST PRICE"]);
    var lbvMarkupPercentage = getFloatValue(record["LBV Markup Percentage"]);
    var priceLevelAPercentage = (!record["Price Level A Percentage"]) ? 0.72 : getFloatValue(record["Price Level A Percentage"]);
    var landCST = getFloatValue(record["LandCST"]);
    
    var numerator = (1+(lbvMarkupPercentage/100));
    return landCST * numerator/priceLevelAPercentage;
}

/**
    With the exception of LIST PRICE, no Price Level will be greater than MAP Price. 

    If the calculation for a Price Level would result in a the value being greater than the value for MAP Price in the CSV, the value for those Price Levels shall be set to MAP Price. 
 */
function applyGeneralPricingRules(record) {
    if (record["MAP Price"] == "null") {
        return;
    }
    var mapPrice = getFloatValue(record["MAP Price"]);
    record["PurchasePriceIngested"] = getPriceAccordingToPricingRule(record["PurchasePriceIngested"], mapPrice);
    record["DaleCSTIngested"] = getPriceAccordingToPricingRule(record["DaleCSTIngested"], mapPrice);
    record["LandCST"] = getPriceAccordingToPricingRule(record["LandCST"], mapPrice);
    record["LandCSTBaseValue"] = getPriceAccordingToPricingRule(record["LandCSTBaseValue"], mapPrice);
}

function getPriceAccordingToPricingRule(priceToCompare, mapPrice) {
    return (priceToCompare > mapPrice) ? mapPrice : priceToCompare;
}

function getFloatValue(inputValue) {
    // Handle the case where inputValue is "null" or some other string
    return !inputValue ? 0 : ((typeof inputValue == "string") ? parseFloat(inputValue) : inputValue);
}

function setDummyExternalId(record) {
    record["ExternalId"] = "";    
}
