'use strict';

var mongoose = require('mongoose');
var collectionName = 'Email';
var schema = new mongoose.Schema({
  meta: {
    from: {
      type: String,
      trim: true,
      required: true
    },
    to: {
      type: String,
      trim: true,
      required: true
    },
    subject: {
      type: String,
      trim: true,
      required: true
    },
    cc: Array,
    bcc: Array
  },
  template: {
    name: {
      type: String,
      trim: true,
      required: true
    },
    data: {
      default: {},
      type: mongoose.Schema.Types.Mixed
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, {
  collection: collectionName
});

/**
 * Generate getters/setters:
 * - templateName(), templateName(name)
 * - templateData(), templateData({ ... })
 *
 * @chainable
 */
['name', 'data'].forEach((m) => {
  var mn = ['template', m.substring(0, 1).toUpperCase(), m.substring(1)].join('');
  schema.methods[mn] = function(val) {
    if (!val) {
      return this.template[m];
    }

    this.template[m] = val;
    return this;
  };
});

module.exports = mongoose.model(collectionName, schema);
