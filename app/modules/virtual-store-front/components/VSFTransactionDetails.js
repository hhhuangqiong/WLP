import React from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import VSFTransactionTable from './VSFTransactionTable';
import CategoryFilter from '../../../main/components/CategoryFilter';
import DateRangePicker from '../../../main/components/DateRangePicker';
import Searchbox from '../../../main/components/Searchbox';

import VSFTransactionStore from '../stores/VSFTransactionStore';
import fetchVSFTransactions from '../actions/fetchVSFTransactions';
import clearVSFTransaction from '../actions/clearVSFTransaction';

const SUBMIT_KEY = 13;
const PAGE_SIZE = 100;

function ensureNumber(value) {
  return +value;
}

let VSFTransactionDetails = React.createClass({
  mixins: [FluxibleMixin, AuthMixin],

  contextTypes: {
    router: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    getStore: React.PropTypes.func.isRequired,
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
        pageSize: PAGE_SIZE,
        userNumber: query.userNumber || '',
      }, done || () => {});
    },
  },

  getInitialState() {
    const state = this.getStore(VSFTransactionStore).getState();
    const query = this.context.router.getCurrentQuery();
    const data = _.merge(state, this.getDefaultQuery(), query);

    return data;
  },

  onChange() {
    const state = this.getStore(VSFTransactionStore).getState();
    const query = this.context.router.getCurrentQuery();
    const data = _.merge({ fromTime: this.getDefaultQuery().fromTime, toTime: this.getDefaultQuery().toTime }, query, state);

    this.setState(data);
  },

  getDefaultQuery() {
    return {
      fromTime: moment().subtract(2, 'day').startOf('day').format('L'),
      toTime: moment().endOf('day').format('L'),
      category: '',
      pageSize: PAGE_SIZE,
      pageIndex: 0,
      userNumber: '',
    };
  },

  getQueryFromState() {
    return {
      fromTime: this.state.fromTime && this.state.fromTime.trim(),
      toTime: this.state.toTime && this.state.toTime.trim(),
      category: this.state.category && this.state.category.trim(),
      userNumber: this.state.userNumber && this.state.userNumber.trim(),
      pageIndex: ensureNumber(this.state.pageIndex),
      pageSize: ensureNumber(this.state.pageSize),
    };
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
                value={this.state.userNumber}
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
            hasNextPage={this.state.hasNextPage}
            loadPage={this.handlePageChange}
          />
        </div>
      </div>
    );
  },

  handleChange(newValue) {
    this.setState(newValue);

    const routeName = _.last(this.context.router.getCurrentRoutes()).name;
    const params = this.context.router.getCurrentParams();
    const query = this.context.router.getCurrentQuery();
    const state = this.getQueryFromState();
    const toBeSent = _.merge(query, state, newValue);

    this.context.executeAction(clearVSFTransaction);
    this.context.router.transitionTo(routeName, params, _.omit(toBeSent || {}, (value) => { return !value; }));
  },

  handlePageChange: function(e) {
    let { identity } = this.context.router.getCurrentParams();

    this.context.executeAction(fetchVSFTransactions, {
      carrierId: identity,
      fromTime: this.state.fromTime,
      toTime: this.state.toTime,
      pageIndex: +this.state.pageIndex + 1,
      pageSize: +this.state.pageSize,
      category: this.state.category,
      userNumber: this.state.userNumber,
    });
  },

  handleStartDateChange(date) {
    const changes = { fromTime: moment(date).startOf('day').format('L') };
    this.handleChange(changes);
  },

  handleEndDateChange(date) {
    const changes = { toTime: moment(date).endOf('day').format('L') };
    this.handleChange(changes);
  },

  handleNumberChange(e) {
    const changes = { userNumber: e.target.value };
    this.setState(changes);
  },

  handleSearchSubmit(e) {
    if (e.which === SUBMIT_KEY) this.handleChange();
  },

  handleVoiceFilterToggle() {
    this.handleChange({ category: this.state.category === 'voice_sticker' ? '' : 'voice_sticker' });
  },

  handleAnimationFilterToggle() {
    this.handleChange({ category: this.state.category === 'animation' ? '' : 'animation' });
  },

  handleStickerFilterToggle() {
    this.handleChange({ category: this.state.category === 'sticker' ? '' : 'sticker' });
  },

  handleCreditFilterToggle() {
    this.handleChange({ category: this.state.category === 'credit' ? '' : 'credit' });
  },
});

export default VSFTransactionDetails;
