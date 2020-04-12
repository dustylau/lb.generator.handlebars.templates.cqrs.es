const fs = require('fs');
const Handlebars = require("handlebars");
const Generator = require("lb.generator.handlebars");
const PrepareModel = require("./models/prepare-cqrs-es-model-es");

// You can load any JSON file to use as a model
const model = require("./models/sample-cqrs-es-model.json");

PrepareModel.prepare(model);

// By default, the templates will be generated with the following default global static values:
Generator.TemplateSettings.DefaultTarget = "Model";
Generator.TemplateSettings.DefaultTargetItem = "entity";
Generator.TemplateSettings.DefaultTargetProperty = "entities";
Generator.TemplateSettings.DefaultModelProperty = "domain";
Generator.TemplateSettings.DefaultTargetItemNameProperty = "Name";

// Create a Template Loader and pass it the directory containing the templates.
// The loader will automatically load all template files ending in ".hbs" and their corresponding settings ".hbs.settings.json"
var loader = new Generator.TemplateLoader('./templates/cqrs.es/domain');

// Load the templates with a callback containing the list of loaded templates
loader.load(function (templates) {
    // Interate the templates and generate each with the supplied model
    for (const template of templates) {
        console.log(`Generating template: ${template.name}`)
        // Generate the template
        template.generate(model);
        // Write the generated template to file
        template.write();
    }
});