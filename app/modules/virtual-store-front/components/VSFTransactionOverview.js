import React from 'react';
import { Link } from 'react-router';
import { FluxibleMixin } from 'fluxible-addons-react';
import AuthMixin from '../../../utils/AuthMixin';

import WidgetNotAvailable from '../../../main/components/common/WidgetNotAvailable';
import VSFTransactionStore from '../stores/VSFTransactionStore';
import fetchVSFWidgets from '../actions/fetchVSFWidgets';

import AuthStore from '../../../main/stores/AuthStore';

const errorMessage = '<div className="widget-not-found">Dashboard is not available</div>';

const VSFTransactionOverview = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [VSFTransactionStore],

    fetchData(context, params, query, done = Function.prototype) {
      context.executeAction(fetchVSFWidgets, {
        carrierId: params.identity,
        userId: context.getStore(AuthStore).getUserId(),
      }, done);
    },
  },

  getInitialState() {
    const store = this.getStore(VSFTransactionStore);
    return { widgets: store.widgets || [] };
  },

  onChange() {
    const store = this.getStore(VSFTransactionStore);
    this.setState({ widgets: store.widgets });
  },

  renderWidgets() {
    const widgets = this.state.widgets;

    if (!widgets || !widgets.length) {
      return <WidgetNotAvailable />;
    }

    return (
      <table className="widget-table">
        <tr>
          <td rowSpan="2" dangerouslySetInnerHTML={{ __html: widgets[0] || errorMessage }}></td>
          <td dangerouslySetInnerHTML={{ __html: widgets[1] || errorMessage }}></td>
        </tr>

        <tr>
          <td dangerouslySetInnerHTML={{ __html: widgets[2] || errorMessage }}></td>
        </tr>
      </table>
    );
  },

  render() {
    const params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner">
          <div className="top-bar-section">

            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <Link to="vsf-transaction-overview" params={params}>Overview</Link>
              </li>

              <li className="top-bar--inner tab--inverted__title">
                <Link to="vsf-transaction-details" params={params}>Details Report</Link>
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

export default VSFTransactionOverview;
