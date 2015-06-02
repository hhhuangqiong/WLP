import _ from 'lodash';
import moment from 'moment';
import {concurrent} from 'contra';

import React from 'react';
import {Link} from 'react-router';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../utils/AuthMixin';

import SMSStore from '../stores/SMSStore';

import fetchSMS from '../actions/fetchSMS';

import SMSTable from '../components/SMSTable';

const defaultStartDate = moment().startOf('day').subtract(1, 'day').format('L');
const defaultEndDate = moment().endOf('day').format('L');

var SMS = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [SMSStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchSMS, {
          carrierId: params.identity,
          startDate: query.number ? (query.startDate || '') : (query.startDate || defaultStartDate),
          endDate: query.number ? (query.endDate || '') : (query.endDate || defaultEndDate),
          number: query.number || '',
          page: query.page || 1,
          pageRec: query.pageRec || 10
        })
      ], done || function() {});
    }
  },

  getStateFromStores: function() {
    return {
      SMSRecords: this.getStore(SMSStore).getSMSRecords(),
      totalRec: this.getStore(SMSStore).getTotalRec()
    }
  },

  getInitialState: function () {
    let query = _.merge({
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      number: null,
      page: 1,
      pageRec: 10
    }, this.context.router.getCurrentQuery());

    return _.merge(this.getStateFromStores(), query);
  },

  onChange: function() {
    this.setState(_.merge(this.getStateFromStores(), this.context.router.getCurrentQuery()));
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
    let params = this.context.router.getCurrentParams();

    return (
      <div className="row">
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">
            <ul className="left">
              <li>
                <Link to="sms-overview" params={params}>Overview</Link>
              </li>
              <li className="active">
                <Link to="sms-details" params={params}>Details Report</Link>
              </li>
            </ul>
            <ul className="right">
              <li className="left">
                <input type="text" name="startDate" value={this.state.startDate} onChange={this.handleStartDateChange} onKeyPress={this.onSubmitQuery} />
              </li>
              <li className="left">
                <input type="text" name="endDate" value={this.state.endDate} onChange={this.handleEndDateChange} onKeyPress={this.onSubmitQuery} />
              </li>
              <li className="right">
                <input type="text" name="username" value={this.state.number} onChange={this.handleUsernameChange} onKeyPress={this.onSubmitQuery} />
              </li>
            </ul>
          </section>
        </nav>
        <div className="large-24 columns">
          <SMSTable
            totalRec={this.state.totalRec}
            SMSRecords={this.state.SMSRecords}
            page={this.state.page}
            pageRec={this.state.pageRec}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
});

export default SMS;
