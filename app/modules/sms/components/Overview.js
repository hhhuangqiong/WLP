import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import WidgetNotAvailable from '../../../components/common/WidgetNotAvailable';
import SMSStore from '../stores/SMSStore';
import loadSMSWidgets from '../actions/loadSMSWidgets';

const errorMessage = '<div className="widget-not-found">Dashboard is not available</div>';

var SMSOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, loadSMSWidgets, {
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

  renderWidgets() {
    let widgets = this.state.widgets;

    if (!widgets || !widgets.length){
      return (<WidgetNotAvailable />);
    }

    return (
      <table className="widget-table">
        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[0] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[1] || errorMessage}}></td>
        </tr>

        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[2] || errorMessage}}></td>
          <td></td>
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
                <Link to="sms-overview" params={params}>Overview</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="sms-details" params={params}>Details Report</Link>
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

export default SMSOverview;
