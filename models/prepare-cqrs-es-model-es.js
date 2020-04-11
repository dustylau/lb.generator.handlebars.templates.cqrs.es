const isEmpty = function(value) {
    return (value === undefined || value === null);
};

const mergeValue = function(value, defaultValue) {
    return isEmpty(value) ? defaultValue : value;
};

const implementInterfaces = function(hasInterfaces, addPropertyCallback) {
    for (const implentedInterface of hasInterfaces.Interfaces) {

        var interface = model.Interfaces.find(i => i.Name == implentedInterface.InterfaceName);

        if (!interface)
            throw `Interface not found: ${implentedInterface.InterfaceName}`;

        if (!hasInterfaces.Namespaces)
            hasInterfaces.Namespaces = [];

        if (interface.Namespace) {
            if (!hasInterfaces.Namespaces.find(namespace => namespace == interface.Namespace))
            {
                hasInterfaces.Namespaces.push(interface.Namespace);
            }
        }

        for (const interfaceProperty of interface.Properties) {
            var property = hasInterfaces.Properties.find(p => p.Name == interfaceProperty.Name);

            if (!property) {
                
                var newProperty = Object.assign({}, interfaceProperty);
                newProperty.Inherited = true;

                if (addPropertyCallback) {
                    addPropertyCallback(newProperty);
                }

                if (newProperty.IsId) {
                    hasInterfaces.Properties.splice(0, 0, newProperty);
                    continue;
                }

                hasInterfaces.Properties.push(newProperty);
                continue;
            }

            property.Name = mergeValue(property.Name, interfaceProperty.Name);
            property.Description = mergeValue(property.Description, interfaceProperty.Description);
            property.Type = mergeValue(property.Type, interfaceProperty.Type);
            property.BaseType = mergeValue(property.BaseType, interfaceProperty.BaseType);
            property.IsId = mergeValue(property.IsId, interfaceProperty.IsId);
            property.IsNullable = mergeValue(property.IsNullable, interfaceProperty.IsNullable);
            property.IsGenerated = mergeValue(property.IsGenerated, interfaceProperty.IsGenerated);
            property.Length = mergeValue(property.Length, interfaceProperty.Length);
            property.Precision = mergeValue(property.Precision, interfaceProperty.Precision);
            property.Scale = mergeValue(property.Scale, interfaceProperty.Scale);
            property.DefaultExpression = mergeValue(property.DefaultExpression, interfaceProperty.DefaultExpression);
            property.IsEnum = mergeValue(property.IsEnum, interfaceProperty.IsEnum);
            property.Enum = mergeValue(property.Enum, interfaceProperty.Enum);

            property.Inherited = true;
        }
    }
};

const prepareModel = function(model) {
    for (const interface of model.Interfaces) {
        implementInterfaces(interface);
    }

    for (const entity of model.DomainEntities) {
        
        implementInterfaces(entity);

        for (const action of entity.Actions) {
            implementInterfaces(action, function(interfaceProperty) {
                interfaceProperty.IsRequestParameter = true;
                interfaceProperty.IsIncludedInResponse = false;
            });
        }

        for (const view of entity.Views) {
            implementInterfaces(view);
        }

        entity.idProperty = entity.Properties.find(property => property.IsId);

        entity.getActionByEvent = function(event) {
            return this.Actions.find(function(action) {
                return action.Event == event;
            });
        };

        for (const view of entity.Views) {
            view.idProperty = view.Properties.find(property => property.IsId);

            if (view.idProperty) {
                view.idProperty = { Name: 'Id', Type: 'Guid' };
            }

            view.dtoName = `${view.Name}Dto`
            view.dtoInstance = `${helpers.camelCase(view.dtoName)}`;

            for (const event of view.Events) {
                event.relatedAction = entity.getActionByEvent(event.Name);
                event.hasAction = event.action ? true : false;
                event.actionProperty = event.relatedAction.Properties.find(property => property.Name == view.idProperty.Name);

                if (!event.actionProperty)
                    event.actionProperty = event.relatedAction.Properties.find(property => property.Name == `${entity.Name}${view.idProperty.Name}`);

                event.dtoName = view.dtoName;
                event.dtoInstance = view.dtoInstance;
                event.eventAction = event.Action ? event.Action.replace("${dto}", event.dtoInstance) : null;
                event.eventCondition = event.Condition ? event.Condition.replace("${dto}", event.dtoInstance) : null;
            }
        }

        for(const property of entity.Properties) {
            if (!property.IsEnum)
                continue;
            
            var enumValue = model.DomainEnums.find(e => e.Name == property.Enum.Name);

            if (!enumValue)
                continue;

            property.EnumValue = enumValue;
        }
    }
};

exports.prepareModel = prepareModel;