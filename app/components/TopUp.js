import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthMixin from '../utils/AuthMixin';

import TopUpStore from '../stores/TopUpStore';

import fetchTopUpHistory from '../actions/fetchTopUpHistory';

import TopUpTable from '../components/TopUpTable';

var TopUp = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [TopUpStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchTopUpHistory, {
          carrierId: params.identity,
          startDate: query.startDate || moment().startOf('day').subtract(1, 'day').format('L'),
          endDate: query.endDate || moment().endOf('day').format('L'),
          number: query.number || '',
          page: query.page || 1,
          pageRec: query.pageRec || 10
        })
      ], done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      histories: this.getStore(TopUpStore).getHistories(),
      totalRec: this.getStore(TopUpStore).getTotalRec()
    }
  },

  getInitialState: function () {
    let query = _.merge({
      startDate: null,
      endDate: null,
      number: null,
      page: 1,
      pageRec: 10
    }, this.context.router.getCurrentQuery());

    return _.merge(this.getStateFromStores(), query);
  },

  onChange: function() {
    this.setState(_.merge(this.getStateFromStores(), this.context.router.getCurrentQuery()));
  },

  // PROBLEM:
  // EndUserTable takes current page to display records, but not current record
  // which may induce wired behavior on change in perPage
  getNewCurrentPage(per, nextPer) {
    return Math.ceil(this.state.page * per / nextPer);
  },

  handlePageRecChange: function(e) {
    let pageRec = e.target.value;
    this.setState({
      page: this.getNewCurrentPage(this.state.pageRec, pageRec),
      pageRec: pageRec
    })
  },

  _getPageNumberForQuery: function() {

  },

  getQueryFromState: function() {
    return {
      startDate: this.state.startDate && this.state.startDate.trim(),
      endDate: this.state.endDate && this.state.endDate.trim(),
      number: this.state.number && this.state.number.trim(),
      page: 1,
      pageRec: this.state.pageRec && parseInt(this.state.pageRec)
    }
  },

  handleQueryChange: function(newQuery) {
    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = _.merge(this.context.router.getCurrentQuery(), this.getQueryFromState(), newQuery);

    this.context.router.transitionTo(routeName, params, _.omit(query, function(value) {
      return !value;
    }));
  },

  handlePageChange: function(page) {
    this.handleQueryChange({ page: page });
  },

  handleUsernameChange: function(e) {
    this.setState({
      number: e.target.value
    });
  },

  handleStartDateChange: function(e) {
    this.setState({
      startDate: e.target.value
    });
  },

  handleEndDateChange: function(e) {
    this.setState({
      endDate: e.target.value
    });
  },

  onSubmitQuery: function(e) {
    // on enter pressed
    if (e.which == 13) {
      this.handleQueryChange();
    }
  },

  render: function() {
    return (
      <div className="row">
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">
            <ul className="left">
              <li>
                <input type="text" name="startDate" value={this.state.startDate} onChange={this.handleStartDateChange} onKeyPress={this.onSubmitQuery} />
              </li>
              <li>
                <input type="text" name="endDate" value={this.state.endDate} onChange={this.handleEndDateChange} onKeyPress={this.onSubmitQuery} />
              </li>
            </ul>
            <ul className="right">
              <li>
                <input type="text" name="username" value={this.state.username} onChange={this.handleUsernameChange} onKeyPress={this.onSubmitQuery} />
              </li>
            </ul>
          </section>
        </nav>
        <div className="large-24 columns">
          <TopUpTable
            totalRec={this.state.totalRec}
            histories={this.state.histories}
            page={this.state.page}
            pageRec={this.state.pageRec}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
});

export default TopUp;
