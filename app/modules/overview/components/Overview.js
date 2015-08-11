import React from 'react';
import {concurrent} from 'contra';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import WidgetNotAvailable from '../../../components/common/WidgetNotAvailable';
import fetchOverviewWidgets from '../actions/fetchOverviewWidgets';
import OverviewStore from '../stores/OverviewStore';
import AuthStore from '../../../stores/AuthStore';

const errorMessage = '<div className="widget-not-found">Dashboard is not available</div>';

export default React.createClass({
  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [OverviewStore],

    fetchData: (context, params, query, done) => {
      concurrent([
        context.executeAction.bind(context, fetchOverviewWidgets, {
          carrierId: params.identity
        })
      ], done || () => {});
    }
  },

  getCurrentState() {
    return {
      widgets: this.getStore(OverviewStore).widgets,
      description: this.getStore(OverviewStore).description
    };
  },

  getInitialState() {
    return this.getCurrentState();
  },

  onChange() {
    this.setState(this.getCurrentState());
  },

  renderWidgets() {
    let widgets = this.state.widgets;

    return (
      <table className="widget-table overview-table large-centered columns">
        <tr>
          <td rowSpan="2" dangerouslySetInnerHTML={{__html: widgets[6] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[0] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[1] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[2] || errorMessage}}></td>
        </tr>

        <tr>
          <td dangerouslySetInnerHTML={{__html: widgets[3] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[4] || errorMessage}}></td>
          <td dangerouslySetInnerHTML={{__html: widgets[5] || errorMessage}}></td>
        </tr>
      </table>
    );
  },

  render() {
    let widgets = this.state.widgets;

    if (!widgets || !widgets.length){
      return (<WidgetNotAvailable />);
    }

    return (
      <div className="overview-background row">
        <div className="large-24 large-centered columns text-center">
          <h2>Welcome {this.getStore(AuthStore).user.displayName}</h2>
          <div className="large-12 large-centered columns">{this.state.description}</div>
          {this.renderWidgets()}
        </div>
      </div>
    );
  }
});