function testRestletForPriceLevels() {
    var record = nlapiLoadRecord('inventoryitem', 1803577);
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
        nlapiSaveRecord(record);
}