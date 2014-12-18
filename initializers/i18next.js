var i18n = require('i18next');
var fs = require('fs');
var path = require('path');
module.exports = function (app) {
    var fallbackLng = 'en';
    var pathes = fs.readdirSync(__dirname + '/../locales/' + fallbackLng).map(function (animal) {
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
};
//# sourceMappingURL=i18next.js.map