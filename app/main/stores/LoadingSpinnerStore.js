import createStore from 'fluxible/addons/createStore';

const LoadingSpinnerStore = createStore({
  storeName: 'LoadingSpinnerStore',

  handlers: {
    FETCH_START: 'showSpinner',
    FETCH_END: 'hideSpinner',
  },

  initialize() {
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
      position: 'absolute', // Element positioning
    };
  },

  showSpinner() {
    this.loaded = false;
    this.emitChange();
  },

  hideSpinner() {
    this.loaded = true;
    this.emitChange();
  },

  getLoaded() {
    return this.loaded;
  },

  getOptions() {
    return this.options;
  },

  getState() {
    return {
      loaded: this.loaded,
      options: this.options,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.loaded = state.loaded;
    this.options = state.options;
  },
});

export default LoadingSpinnerStore;
