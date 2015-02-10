'use strict';
//TODO allow models to be located in different folder, e.g., app/notification/models/
var _ = require('underscore');
var fs = require('fs');
/**
Register the Mongoose models in the path specified
@method registerModels
@param {String} path Absolute path to the models directory
*/
exports.registerModels = function (path) {
    _(fs.readdirSync(path)).filter(function (f) {
        return f.indexOf('.js') !== -1;
    }).forEach(function (file) {
        require(path + '/' + file);
    });
};