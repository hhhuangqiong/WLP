import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../utils/AuthMixin';

import SMSStore from '../stores/SMSStore';

import fetchSMSWidgets from '../actions/fetchSMSWidgets';

import SMSTable from '../components/SMSTable';

var SMSOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchSMSWidgets, {
          carrierId: params.identity
        })
      ], done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      widgets: this.getStore(SMSStore).getWidgets()
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
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">
            <ul className="left">
              <li className="active">
                <Link to="sms-overview" params={params}>Overview</Link>
              </li>
              <li>
                <Link to="sms-details" params={params}>Details Report</Link>
              </li>
            </ul>
          </section>
        </nav>
        <div className="large-24 columns">
          <ul>
          {this.state.widgets.map((widget) => {
            return <li>{widget}</li>;
          })}
          </ul>
        </div>
      </div>
    );
  }
});

export default SMSOverview;
