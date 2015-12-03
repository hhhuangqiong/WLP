import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';
import {concurrent} from 'contra';

import VSFTransactionTable from './VSFTransactionTable';
import CategoryFilter from '../../../main/components/CategoryFilter';
import DateRangePicker from '../../../main/components/DateRangePicker';
import Searchbox from '../../../main/components/Searchbox';

import VSFTransactionStore from '../stores/VSFTransactionStore';
import fetchVSFTransactions from '../actions/fetchVSFTransactions';

const debug = require('debug')('src:modules/virtual-store-front/components/VSFTransactionDetails');

const SUBMIT_KEY = 13;

let VSFTransactionDetails = React.createClass({
  mixins: [FluxibleMixin, AuthMixin],

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired
  },

  statics: {
    storeListeners: [VSFTransactionStore],

    fetchData(context, params, query, done) {
      context.executeAction(fetchVSFTransactions, {
        carrierId: params.identity,
        fromTime: query.fromTime || moment().subtract(2, 'day').startOf('day').format('L'),
        toTime: query.toTime || moment().endOf('day').format('L'),
        category: query.category || '',
        pageIndex: query.page || 0,
        pageSize: config.PAGES.CALLS.PAGE_SIZE,
        userNumber: query.userNumber || ''
      }, done || () => {});

    }
  },

  getInitialState() {
    let state = this.getStore(VSFTransactionStore).getState();
    let query = this.context.router.getCurrentQuery();
    let data = _.merge(state, this.getDefaultQuery(), query);

    return data;
  },

  getDefaultQuery() {
    return {
      fromTime: moment().subtract(2, 'day').startOf('day').format('L'),
      toTime: moment().endOf('day').format('L'),
      category: '',
      pageSize: config.PAGES.CALLS.PAGE_SIZE,
      pageIndex: 0,
      userNumber: ''
    };
  },

  onChange: function() {
    let state = this.getStore(VSFTransactionStore).getState();
    let query = this.context.router.getCurrentQuery();
    let data = _.merge({ fromTime: this.getDefaultQuery().fromTime , toTime: this.getDefaultQuery().toTime }, query, state)

    debug('VSFTransactionDetails onChagne', data);
    this.setState(data);
  },

  getQueryFromState: function() {
    return {
      fromTime: this.state.fromTime && this.state.fromTime.trim(),
      toTime: this.state.toTime && this.state.toTime.trim(),
      category: this.state.category && this.state.category.trim(),
      userNumber: this.state.userNumber && this.state.userNumber.trim(),
      pageIndex: this.state.pageIndex && this.state.pageIndex.trim(),
      pageSize: this.state.pageSize
    }
  },

  handleChange(newValue) {
    debug('handleChange', newValue);
    this.setState(newValue);

    let routeName = _.last(this.context.router.getCurrentRoutes()).name;
    let params = this.context.router.getCurrentParams();
    let query = this.context.router.getCurrentQuery();
    let state = this.getQueryFromState();
    let toBeSent = _.merge(query, state, newValue);

    debug('query to be made', toBeSent)
    this.context.router.transitionTo(routeName, params, _.omit(toBeSent || {}, (value) => { return !value; }));
  },

  handleStartDateChange(date) {
    let changes = { fromTime: moment(date).startOf('day').format('L') };
    this.handleChange(changes);
  },

  handleEndDateChange(date) {
    let changes = { toTime: moment(date).endOf('day').format('L') };
    this.handleChange(changes);
  },

  handleNumberChange(e) {
    let changes = { userNumber: e.target.value };
    this.setState(changes);
  },

  handleSearchSubmit(e) {
    debug('handleSearchSubmit', e)

    if (e.which === SUBMIT_KEY){
      this.handleChange();
    }
  },

  handleVoiceFilterToggle(e) {
    this.handleChange({ category: this.state.category === 'voice_sticker' ? '' : 'voice_sticker' });
  },

  handleAnimationFilterToggle(e) {
    this.handleChange({ category: this.state.category === 'animation' ? '' : 'animation' });
  },

  handleStickerFilterToggle(e) {
    this.handleChange({ category: this.state.category === 'sticker' ? '' : 'sticker' });
  },

  handleCreditFilterToggle(e) {
    this.handleChange({ category: this.state.category === 'credit' ? '' : 'credit' });
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

            <ul className="left top-bar--inner">
              <li className="top-bar--inner">
                <DateRangePicker
                  displayFormat="MM/DD/YYYY"
                  startDate={this.state.fromTime}
                  endDate={this.state.toTime}
                  handleStartDateChange={this.handleStartDateChange}
                  handleEndDateChange={this.handleEndDateChange}
                />
              </li>
            </ul>

            <div className="large-5 columns left top-bar-section">
              <CategoryFilter
                category={this.state.category}
                handleVoiceFilterToggle={this.handleVoiceFilterToggle}
                handleAnimationFilterToggle={this.handleAnimationFilterToggle}
                handleStickerFilterToggle={this.handleStickerFilterToggle}
                handleCreditFilterToggle={this.handleCreditFilterToggle}
              />
            </div>

            <div className="call-search top-bar-section right">
              <Searchbox
                search={this.state.userNumber}
                placeHolder="Username/Mobile"
                onInputChangeHandler={this.handleNumberChange}
                onKeyPressHandler={this.handleSearchSubmit}
              />
            </div>

          </div>
        </nav>

        <div className="large-24 columns">
          <VSFTransactionTable
            transactions={this.state.transactions}
          />
        </div>
      </div>
    );
  }
});

export default VSFTransactionDetails;
