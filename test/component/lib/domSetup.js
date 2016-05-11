// Since enzyme's mount API requires a DOM,
// JSDOM is required in order to use mount
// if you are not already in a browser environment (ie, a Node environment).
// More: https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

import { jsdom } from 'jsdom';
const exposedProperties = ['window', 'navigator', 'document'];

global.document = jsdom('');
global.window = document.defaultView;
global.navigator = {
  userAgent: 'node.js',
};

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});
