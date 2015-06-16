import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../utils/AuthMixin';

import CallsStore from '../stores/CallsStore';
import fetchCallsWidgets from '../actions/fetchCallsWidgets';

var CallsOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [CallsStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCallsWidgets, {
          carrierId: params.identity
        })
      ], done || function() {});
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
          <ul className="widget-list widget-list--calls">
          {this.state.widgets.map((widget) => {
            if (widget != '') {
              return <li className="left" dangerouslySetInnerHTML={{__html: widget}}></li>;
            }
          })}
          </ul>
        </div>
      </div>
    );
  }
});

export default CallsOverview;
