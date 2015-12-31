import _ from 'lodash';
import {createStore} from 'fluxible/addons';

var debug = require('debug')('wlp:loadingSpinnerStore');

var LoadingSpinnerStore = createStore({
  storeName: 'LoadingSpinnerStore',

  handlers: {
    FETCH_START: 'showSpinner',
    FETCH_END:   'hideSpinner',
    FETCH_CALLS_STATS_MONTHLY_START: 'showSpinner',
    FETCH_CALLS_STATS_MONTHLY_END: 'hideSpinner',
    FETCH_CALLS_STATS_TOTAL_START: 'showSpinner',
    FETCH_CALLS_STATS_TOTAL_END: 'hideSpinner'
  },

  showSpinner: function() {
    this.loaded = false;
    this.emitChange();
  },

  hideSpinner: function() {
    this.loaded = true;
    this.emitChange();
  },

  initialize: function() {
    this.loaded = true;
    this.options = {
      lines: 50, // The number of lines to draw
      length: 0, // The length of each line
      width: 10, // The line thickness
      radius: 25, // The radius of the inner circle
      scale: 1, // Scales overall size of the spinner
      corners: 1, // Corner roundness (0..1)
      color: '#FFF', // #rgb or #rrggbb or array of colors
      opacity: 0, // Opacity of the lines
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      className: 'spinner', // The CSS class to assign to the spinner
      top: '50%', // Top position relative to parent
      left: '50%', // Left position relative to parent
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      position: 'absolute' // Element positioning
    }
  },

  getLoaded: function() {
    return this.loaded;
  },

  getOptions: function() {
    return this.options;
  },

  getState: function() {
    return {
      loaded: this.loaded,
      options: this.options
    };
  },

  dehydrate: function() {
    return this.getState();
  },

  rehydrate: function(state) {
    this.loaded = state.loaded;
    this.options = state.options;
  }
});

export default LoadingSpinnerStore;
