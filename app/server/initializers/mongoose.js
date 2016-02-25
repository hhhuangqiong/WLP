// TODO allow models to be located in different folder, e.g., app/notification/models/
import _ from 'underscore';
import fs from 'fs';

/**
Register the Mongoose models in the path specified
@method registerModels
@param {String} path Absolute path to the models directory
*/
exports.registerModels = function registerModels(path) {
  _(fs.readdirSync(path))
    .filter(f => f.indexOf('.js') !== -1)
    .forEach(file => {
      require(`${path}/${file}`);
    });
};
