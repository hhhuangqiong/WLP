'use strict';

import React from 'react';
import {FluxibleMixin} from 'fluxible';
import {RouterMixin} from 'flux-router-component';

import {PublicHtml, AuthenticatedHtml} from 'app/components/Wrapper';
import Home from 'app/components/Home';
import About from 'app/components/About';
import SignIn from 'app/components/SignIn';
import Page from 'app/components/Page';
import Forgot from 'app/components/ForgetPass';
import Overview from 'app/components/Overview';
import Companies from 'app/components/Companies';

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
    let state = this.getStore(ApplicationStore).getState();
    this.setState(state);
  },
  render: function () {
    let output = '';
    // looking for alternatives, and better be negative default
    let authenticated = true;
    //debug('current page: %s', this.state.currentPageName, this.state.route);
    //choose the right page based on the route
    switch (this.state.currentPageName) {
      case 'signin':
        output = <SignIn/>;
        authenticated = false;
        break;
      case 'home':
        output = <Home/>;
        authenticated = false;
        break;
      case 'about':
        output = <About/>;
        break;
      case 'forgot':
        output = <Forgot/>;
        break;
      case 'overview':
        output = <Overview/>;
        break;
      case 'companies':
        output = <Companies context={this.props.context}/>;
        break;
      case 'company':
        output = <Companies context={this.props.context} subPage={this.state.route.params.subPage}/>;
        break;
      case 'page':
        output = <Page context={this.props.context}/>;
        break;
    }

    //render content
    //output component is passed as prop children to wrapper component
    //see this: https://facebook.github.io/react/docs/reusable-components.html#single-child
    if (authenticated) {
      return (
        <AuthenticatedHtml pageTitle={this.state.pageTitle}>
          {output}
        </AuthenticatedHtml>
      )
    } else {
      return (
        <PublicHtml>
          {output}
        </PublicHtml>
      )
    }
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
