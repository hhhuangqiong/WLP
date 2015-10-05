import _ from 'lodash';
import moment from 'moment';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../utils/AuthMixin';

import WidgetNotAvailable from './common/WidgetNotAvailable';

import CallsStore from '../stores/CallsStore';
import AuthStore  from '../stores/AuthStore';

import fetchCallsWidgets from '../actions/fetchCallsWidgets';

const ERROR_MESSAGE = '<div className="widget-not-found">Dashboard is not available</div>';

var CallsOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [CallsStore],

    fetchData: function(context, params, query, done) {
      context.executeAction(fetchCallsWidgets, {
        carrierId: params.identity,
        userId: context.getStore(AuthStore).getUserId()
      }, done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      widgets: this.getStore(CallsStore).getWidgets()
    };
  },

  getInitialState: function () {
    return this.getStateFromStores();
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  renderWidgets() {
    let widgets = this.state.widgets;

    if (!widgets || !widgets.length){
      return (<WidgetNotAvailable />);
    }

    return (
      <table className="widget-table">
        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[0] || ERROR_MESSAGE}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[1] || ERROR_MESSAGE}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[2] || ERROR_MESSAGE}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[3] || ERROR_MESSAGE}}></td>
        </tr>

        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[4] || ERROR_MESSAGE}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[5] || ERROR_MESSAGE}}></td>
          <td rowSpan="2" dangerouslySetInnerHTML={{__html: widgets[6] || ERROR_MESSAGE}}></td>
          <td rowSpan="2" dangerouslySetInnerHTML={{__html: widgets[7] || ERROR_MESSAGE}}></td>
        </tr>

        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[8] || ERROR_MESSAGE}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[9] || ERROR_MESSAGE}}></td>
        </tr>
      </table>
    );
  },

  render: function() {
    let params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link to="calls-overview" params={params}>Overview</Link>
              </li>

              <li className="top-bar--inner tab--inverted__title">
                <Link to="calls-details" params={params}>Details Report</Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="large-24 columns">
          {this.renderWidgets()}
        </div>
      </div>
    );
  }
});

export default CallsOverview;
