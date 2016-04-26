import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { FluxibleMixin } from 'fluxible-addons-react';

import WidgetNotAvailable from '../../../main/components/common/WidgetNotAvailable';
import loadSMSWidgets from '../actions/loadSMSWidgets';

import SMSStore from '../stores/SMSStore';
import AuthStore from '../../../main/stores/AuthStore';

const errorMessage = '<div className="widget-not-found">Dashboard is not available</div>';

const SMSOverview = React.createClass({
  contextTypes: {
    router: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData(context, params, query, done) {
      context.executeAction(loadSMSWidgets, {
        carrierId: params.identity,
        userId: context.getStore(AuthStore).getUserId(),
      }, done || (() => {}));
    },
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    return {
      widgets: this.getStore(SMSStore).getWidgets(),
    };
  },

  renderWidgets() {
    const widgets = this.state.widgets;

    if (!widgets || !widgets.length) {
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

  render() {
    const { role, identity } = this.context.params;

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link
                  to={`/${role}/${identity}/sms/overview`}
                  activeClassName="active"
                >
                  <FormattedMessage id="overview" defaultMessage="Overview" />
                </Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link
                  to={`/${role}/${identity}/sms/details`}
                  activeClassName="active"
                >
                  <FormattedMessage id="detailsReport" defaultMessage="Details Report" />
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="large-24 columns">
          {this.renderWidgets()}
        </div>
      </div>
    );
  },
});

export default SMSOverview;
