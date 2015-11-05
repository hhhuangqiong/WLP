import _ from 'lodash';
import moment from 'moment';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import WidgetNotAvailable from '../../../main/components/common/WidgetNotAvailable';

import ImStore from '../stores/ImStore';
import AuthStore  from '../../../main/stores/AuthStore';

import fetchImWidgets from '../actions/fetchImWidgets';

const errorMessage = '<div className="widget-not-found">Dashboard is not available</div>';

var ImOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [ImStore],

    fetchData: function(context, params, query, done) {
      context.executeAction(fetchImWidgets, {
        carrierId: params.identity,
        userId: context.getStore(AuthStore).getUserId()
      }, done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      widgets: this.getStore(ImStore).getWidgets()
    };
  },

  getInitialState: function () {
    return this.getStateFromStores();
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  renderImWidgets() {
    let widgets = this.state.widgets;

    if (!widgets || !widgets.length){
      return (<WidgetNotAvailable />);
    }

    return (
      <table className="widget-table" border="0" cellSpacing="0" cellPadding="0">
        <tr>
          <td colSpan="3" rowSpan="3">
            <div className="im-volumn-hack" dangerouslySetInnerHTML={{__html: widgets[0] || errorMessage}}></div>
          </td>
          <td dangerouslySetInnerHTML={{__html: widgets[1] || errorMessage}}></td>
        </tr>

        <tr><td dangerouslySetInnerHTML={{__html: widgets[2] || errorMessage}}></td></tr>

        <tr><td dangerouslySetInnerHTML={{__html: widgets[3] || errorMessage}}></td></tr>

        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[4] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[5] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[6] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[7] || errorMessage}}></td>
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
                <Link to="im-overview" params={params}>Overview</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="im" params={params}>Details Report</Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="large-24 columns">
          {this.renderImWidgets()}
        </div>
      </div>
    );
  }
});

export default ImOverview;
