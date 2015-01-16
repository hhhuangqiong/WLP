import nconf = require('nconf');

var debug = require('debug');
var path = require('path');

function initialize(env: string, configDir: string) {

    nconf.argv();
    nconf.env('__');

    var files = ['global.json', env + '.json', 'urls.json'];

    files.forEach(function(f: string) {
        nconf.file(f, {
            file: f,
            dir: configDir,
            search: true
        });
    });

    //debug('loading configuration files %j under "%s"', files, configDir);
    var defaults = require(path.join(configDir, 'defaults.json'));
    nconf.defaults(defaults);

    return nconf;
}

export = initialize;
