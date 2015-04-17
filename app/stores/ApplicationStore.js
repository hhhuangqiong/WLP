'use strict';
import {createStore} from 'fluxible/addons';

import routesConfig from 'app/config/routes';

var debug = require('debug')('ApplicationStore');

var ApplicationStore = createStore({
  // The store should define a static property that gives the name of the store.
  // This is used internally and for debugging purposes.
  storeName: 'ApplicationStore',

  // The store should define a static property that
  // maps action names to handler functions or method names.
  // These functions will be called in the event that an action has been dispatched by the Dispatchr instance.
  handlers: {
    'CHANGE_ROUTE_SUCCESS' : 'handleNavigate',
    'UPDATE_PAGE_TITLE' : 'updatePageTitle'
  },
  updatePageTitle: function (title) {
    this.pageTitle = title.pageTitle;
    this.emitChange();
  },
  initialize: function () {
    this.currentPageName = null;
    this.currentPage = null;
    this.currentRoute = null;
    this.pages = routesConfig;
    this.pageTitle = '';
  },
  /**
   * is referred from handlers
   *
   * @method handleNavigate
   * @param route
   */
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
  /**
   * @method getState
   * @returns Object {{route: (null|*)}}
   */
  getState: function () {
    return {
      currentPageName: this.currentPageName,
      currentPage: this.currentPage,
      pages: this.pages,
      route: this.currentRoute,
      pageTitle: this.pageTitle
    };
  },
  // The store should define this function to dehydrate the store
  // if it will be shared between server and client.
  // It should return a serializable data object that will be passed to the client.
  dehydrate: function () {
    return this.getState();
  },
  // The store should define this function to rehydrate the store
  // if it will be shared between server and client.
  // It should restore the store to the original state using the passed state.
  rehydrate: function (state) {
    this.currentPageName = state.currentPageName;
    this.currentPage = state.currentPage;
    this.pages = state.pages;
    this.currentRoute = state.route;
    this.pageTitle = state.pageTitle;
  }
});


export default ApplicationStore;
