'use strict';

import React from 'react';
import {FluxibleMixin} from 'fluxible';
import {RouterMixin} from 'flux-router-component';

import Home from 'app/components/Home';
import About from 'app/components/About';
import SignIn from 'app/components/SignIn';
import Page from 'app/components/Page';

import ApplicationStore from 'app/stores/ApplicationStore';

var debug = require('debug')('WhiteLabelPortal:Application');

var Application = React.createClass({
  mixins: [RouterMixin, FluxibleMixin],
  statics: {
    storeListeners: [ApplicationStore]
  },
  getInitialState: function () {
    return this.getStore(ApplicationStore).getState();
  },
  onChange: function () {
    var state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },
  render: function () {
    var output = '';
    debug('current page: %s', this.state.currentPageName);
    //choose the right page based on the route
    switch (this.state.currentPageName) {
      case 'signin':
        output = <SignIn/>;
        break;
      case 'home':
        output = <Home/>;
        break;
      case 'about':
        output = <About/>;
        break;
      case 'forgot':
        output = <Home/>;
        break;
      case 'page':
        output = <Page context={this.props.context}/>;
        break;
    }
    //render content
    return (
      <div>
        {output}
      </div>
    );
  },
  componentDidUpdate: function(prevProps, prevState) {
    var newState = this.state;
    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }
    document.title = newState.pageTitle;
  }
});

export default Application;
