
import nconf = require('nconf');


var debug = require('debug');
var path = require('path');

function initialize(env: string) {

    nconf.argv();
    nconf.env('__');

    var dir = path.resolve(__dirname + '/../../config/');
    var files = ['global.json', env + '.json', 'urls.json'];

    files.forEach(function(f: string) {
        nconf.file(f, {
            file: f,
            dir: dir,
            search: true
        });
    });
    debug('loading configuration files %j under "%s"', files, dir);

    var defaults = require('../../config/defaults.json');
    nconf.defaults(defaults);

    return nconf;
}

export = initialize;
