import React                  from 'react';
import classnames             from 'classnames';
import {RouteHandler}         from 'react-router';
import {concurrent}           from 'contra';
import Sidebar                from '../Sidebar';
import Navigation             from '../Navigation';
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
        <div className={classnames('content-frame', {offcanvas: this.state.isOffCanvas})}>
          <nav className="top-bar app-header" data-topbar role="navigation">
            <ul className="title-area app-header__title-area">
              <li className="name app-header__title">
                <h1>{this.props.pageTitle}</h1>
              </li>
            </ul>
            <Navigation />
          </nav>
          <div className="row">
            <div className="large-24 columns">
              <RouteHandler/>
            </div>
          </div>
        </div>
        <SystemMessage />
        <LoadingSpinner />
      </div>
    );
  }
});

module.exports = Protected;
