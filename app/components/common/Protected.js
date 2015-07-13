import React                  from 'react';
import classnames             from 'classnames';
import {concurrent}           from 'contra';
import Sidebar                from '../Sidebar';
import CanvasWrapper          from './CanvasWrapper';
import Navigation             from './NavigationBar';
import Title                  from './NavigationTitle';
import Menu                   from './NavigationMenu';
import Content                from './MainContent';
import SystemMessage          from './SystemMessage';
import LoadingSpinner         from './LoadingSpinner';
import fetchCurrentCompanyInfo from '../../actions/fetchCurrentCompanyInfo';
import fetchManagingCompanies from '../../actions/fetchManagingCompanies';

var Protected = React.createClass({
  statics: {
    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCurrentCompanyInfo, { carrierId: params.identity }),
        context.executeAction.bind(context, fetchManagingCompanies, {})
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
    })
  },

  render: function() {
    return (
      <div>
        <Sidebar isOffCanvas={this.state.isOffCanvas} handleOffCavnas={this._setOffCanvas} />
        <CanvasWrapper isOffCanvas={this.state.isOffCanvas}>
          <Navigation>
            <Title title={this.props.pageTitle} />
            <Menu />
          </Navigation>
          <Content />
        </CanvasWrapper>
        <SystemMessage />
        <LoadingSpinner />
      </div>
    );
  }
});

module.exports = Protected;
