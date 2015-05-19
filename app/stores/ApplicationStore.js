import {createStore} from 'fluxible/addons';

var debug = require('debug')('ApplicationStore');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',

  handlers: {
    'FETCH_MANGAING_COMPANIES_SUCCESS':  'loadedCompanies'
  },

  loadedCompanies: function(companies) {
    this.managingCompanies = companies;
    this.emitChange();
  },

  getManagingCompanies: function() {
    return this.managingCompanies;
  },

  getState: function() {
    return {
      managingCompanies: this.managingCompanies
    };
  },

  dehydrate: function () {
    return this.getState();
  },

  rehydrate: function (state) {
    this.managingCompanies = state.managingCompanies;
  }
});

export default ApplicationStore;
