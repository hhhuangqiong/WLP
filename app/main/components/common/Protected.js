import React                   from 'react';
import classnames              from 'classnames';
import {concurrent}            from 'contra';
import Sidebar                 from './Sidebar';
import CanvasWrapper           from './CanvasWrapper';
import Navigation              from './NavigationBar';
import Title                   from './NavigationTitle';
import Menu                    from './NavigationMenu';
import Content                 from './MainContent';
import SystemMessage           from './SystemMessage';
import LoadingSpinner          from './LoadingSpinner';

import AuthStore               from '../../../main/stores/AuthStore';
import fetchCurrentCompanyInfo from '../../actions/fetchCurrentCompanyInfo';
import fetchManagingCompanies  from '../../actions/fetchManagingCompanies';
import fetchAppIds             from '../../../main/actions/fetchAppIds';

var Protected = React.createClass({

  statics: {
    // `context` is prepared by server's `renderApp()`
    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCurrentCompanyInfo, { carrierId: params.identity }),
        context.executeAction.bind(context, fetchManagingCompanies, {}),
        context.executeAction.bind(context, fetchAppIds, { carrierId: params.identity, userId: context.getStore(AuthStore).getUserId() })
      ], done || function() {});
    }
  },

  getInitialState: function() {
    return {
      isOffCanvas: true
    };
  },

  _setOffCanvas: function(isOffCanvas) {
    this.setState({
      isOffCanvas: isOffCanvas
    });
  },

  render: function() {
    return (
      <div className={classnames({ 'wrapper--extended': !this.state.isOffCanvas })}>
        <Sidebar isOffCanvas={this.state.isOffCanvas} handleOffCavnas={this._setOffCanvas} />
        <CanvasWrapper isOffCanvas={this.state.isOffCanvas}>
          <Navigation isOffCanvas={this.state.isOffCanvas}>
            <Title title={this.props.pageTitle} />
            <Menu />
          </Navigation>
          <Content isOffCanvas={this.state.isOffCanvas} />
        </CanvasWrapper>
        <SystemMessage />
        <LoadingSpinner />
      </div>
    );
  }
});

module.exports = Protected;
