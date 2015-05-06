'use strict';
import {createStore} from 'fluxible/addons';

import routesConfig from '../config/routes';

var debug = require('debug')('ApplicationStore');

var ApplicationStore = createStore({
  storeName: 'ApplicationStore',
  handlers: {
    'CHANGE_ROUTE_SUCCESS' : 'handleNavigate',
    'UPDATE_PAGE_TITLE' : 'updatePageTitle'
  },
  updatePageTitle: function (payload) {
    this.pageTitle = payload.pageTitle;
    this.emitChange();
  },
  //initialize: function () {
    //this.currentPageName = null;
    //this.currentPage = null;
    //this.currentRoute = null;
    //this.pages = routesConfig;
    //this.pageTitle = '';
  //},
  handleNavigate: function (route) {
    if (this.currentRoute && (this.currentRoute.url === route.url)) {
      return;
    }
    var pageName = route.config.page;
    var page = this.pages[pageName];

    this.currentPageName = pageName;
    this.currentPage = page;
    this.currentRoute = route;
    this.emitChange();
  },
  getState: function() {
    return {
      currentPageName: this.currentPageName,
      currentPage: this.currentPage,
      pages: this.pages,
      route: this.currentRoute,
      pageTitle: this.pageTitle
    };
  },
  dehydrate: function () {
    return this.getState();
  },
  rehydrate: function (state) {
    this.currentPageName = state.currentPageName;
    this.currentPage = state.currentPage;
    this.pages = state.pages;
    this.currentRoute = state.route;
    this.pageTitle = state.pageTitle;
  }
});

export default ApplicationStore;
