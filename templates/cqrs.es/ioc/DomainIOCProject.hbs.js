module.exports = {
    prepareModel: function(model) {

        //model.EventStorePort = 9991;

        return model; 
    },
    prepareTarget: function(target) { return target; },
    prepareItem: function(item) { return item; },
    prepareItemModel: function(itemModel) { return itemModel; }
};