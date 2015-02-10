var i18n = require('i18next');
var fs   = require('fs');
var path = require('path');

function i18nextInit(app) {
    var fallbackLng = 'en';
    //TODO ugly; pass via parameter
    var pathes = fs.readdirSync(__dirname + '/../../../../locales/server/' + fallbackLng).map(function (animal) {
        return path.basename(animal, '.json');
    });
    i18n.init({
        ns: { namespaces: pathes, defaultNs: 'global' },
        fallbackLng: fallbackLng,
        ignorePathes: ['public'],
        resGetPath: 'locales/__lng__/__ns__.json'
    });
    i18n.registerAppHelper(app).serveClientScript(app).serveDynamicResources(app).serveMissingKeyRoute(app);
    app.use(i18n.handle);
}
module.exports = i18nextInit;