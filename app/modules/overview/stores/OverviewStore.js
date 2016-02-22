import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'OverviewStore',

  handlers: {
    FETCH_OVERVIEW_WIDGETS_SUCCESS: 'handleLoadWidgetSuccess',
  },

  initialize() {
    this.widgets = [];
    this.description = '';
  },

  handleLoadWidgetSuccess(payload) {
    if (payload && payload.widgets) {
      this.widgets = payload.widgets;
    } else {
      this.widgets = [];
    }

    this.emitChange();
  },

  dehydrate() {
    return {
      widgets: this.widgets,
      description: this.description,
    };
  },

  rehydrate(state) {
    this.widgets = state.widgets;
    this.description = state.description;
  },
});
