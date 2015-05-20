import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../utils/AuthMixin';

import CallsStore from '../stores/CallsStore';

import {fetchCalls} from '../actions/fetchCalls';

import CallsTable from './CallsTable';
import Pagination from './Pagination';

var Calls = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [CallsStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCalls, {
          carrierId: params.identity,
          fromTime: query.fromTime || moment().startOf('day'),
          toTime: query.fromTime || moment().endOf('day'),
          page: query.page || 0
        })
      ], done || function() {});
    }
  },

  getInitialState: function () {
    return {
      current: 1,
      per: 10,
      calls: this.getStore(CallsStore).getCalls(),
      callsCount: this.getStore(CallsStore).getCallsCount(),
      //currentUser: this.context.router.getCurrentParams().username ? this.getStore(CallsStore).getCurrentUser() : null
    };
  },

  onChange: function() {
    let state = this.getStore(CallsStore).getState();
    this.setState(state);
  },

  getNewCurrentPage(per, nextPer) {
    return Math.ceil(this.state.current * per / nextPer);
  },

  handlePerChange: function(e) {
    let per = e.target.value;
    this.setState({
     current: this.getNewCurrentPage(this.state.per, per),
     per: per
    })
  },

  handlePageChange: function(page) {
    this.setState({
      current: page
    });
  },

  render: function() {
    return (
      <div className="row">
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">

          </section>
        </nav>
        <div className="large-24 columns">
            <CallsTable calls={this.state.calls} current={this.state.current} per={this.state.per} />
            <Pagination total={this.state.callsCount} current={this.state.current} per={this.state.per} onPageChange={this.handlePageChange} />
        </div>
      </div>
    );
  }
});

export default Calls;
