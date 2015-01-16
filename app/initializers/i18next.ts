
import _ = require('underscore');
var i18n = require('i18next');

var log: any = require('debug')('app:initializers:i18next');
var fs: any = require('fs');
import path = require('path');

function i18nextInit(app : any) : void {
  var fallbackLng: string = 'en';
  var pathes:string[] = fs.readdirSync(__dirname + '/../../../locales/'+fallbackLng).map(
    function(animal){
      return path.basename(animal,'.json')
    }
  );

  i18n.init({
      ns: { namespaces: pathes, defaultNs: 'global'},
      fallbackLng: fallbackLng,
      ignorePathes: ['public'],
      resGetPath: 'locales/__lng__/__ns__.json'
  });

  i18n.registerAppHelper(app)
      .serveClientScript(app)
      .serveDynamicResources(app)
      .serveMissingKeyRoute(app);

  app.use(i18n.handle);
}

export = i18nextInit;
