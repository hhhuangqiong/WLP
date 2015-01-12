'use strict';


module.exports = function(conf){
  var defaultOptions = conf.i18next;
  i18n.init(defaultOptions);
  i18n.addPostProcessor('markdown', function(val, key, opts) {
    return require('markdown').markdown.toHTML(val);
  });
}