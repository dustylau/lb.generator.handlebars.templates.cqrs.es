module.exports = {
    prepareModel: function(model) { return model; },
    prepareTarget: function(target) { return target; },
    prepareItem: function(item) { 
        for (const view of item.Views) {
            view.controllerRoute = view.Name.replace(item.Name + 'List', '');
        }    
        return item; 
    },
    prepareItemModel: function(itemModel) { return itemModel; }
};