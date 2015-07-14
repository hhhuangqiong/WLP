import React from 'react';
import { Link } from 'react-router';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';
import VSFTransactionStore from  '../stores/VSFTransactionStore';
import fetchVSFWidgets from  '../actions/fetchVSFWidgets';
import {concurrent} from 'contra';

let VSFTransactionOverview = React.createClass({
  mixins: [FluxibleMixin, AuthMixin],

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired
  },

  statics: {
    storeListeners: [VSFTransactionStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchVSFWidgets, {
          carrierId: params.identity
        })
      ], done || function() {});
    }
  },

  getInitialState() {
    let store = this.getStore(VSFTransactionStore);
    return { widgets: store.widgets || [] };
  },

  onChange() {
    let store = this.getStore(VSFTransactionStore);
    this.setState({ widgets: store.widgets });
  },

  render() {
    let params = this.context.router.getCurrentParams();

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

export default VSFTransactionOverview;
