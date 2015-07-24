import _ from 'lodash';
import {createStore} from 'fluxible/addons';

const debug = require('debug')('src:modules/overview/components/OverviewStore');

export default createStore({
  storeName: 'OverviewStore',

  initialize() {
    this.widgets = [];
    this.description = '';
  },

  dehydrate() {
    return {
      widgets: this.widgets,
      description: this.description
    };
  },

  rehydrate(state) {
    this.widgets = state.widgets;
    this.description = state.description;
  }
});
