'use strict';
import {createStore} from 'fluxible/addons';

var ApplicationStore = createStore({
  // The store should define a static property that gives the name of the store.
  // This is used internally and for debugging purposes.
  storeName: 'ApplicationStore',

  // The store should define a static property that
  // maps action names to handler functions or method names.
  // These functions will be called in the event that an action has been dispatched by the Dispatchr instance.
  handlers: {
    'CHANGE_ROUTE': 'handleNavigate'
  },
  initialize: function () {
    this.currentRoute = null;
  },
  /**
   * is referred from handlers
   *
   * @method handleNavigate
   * @param route
   */
  handleNavigate: function (route) {
    if (this.currentRoute && route.path === this.currentRoute.path) {
      return;
    }

    this.currentRoute = route;
    this.emitChange();
  },
  /**
   * @method getState
   * @returns Object {{route: (null|*)}}
   */
  getState: function () {
    return {
      route: this.currentRoute
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
    this.currentRoute = state.route;
  }
});


export default ApplicationStore;
