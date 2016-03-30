import React, { PropTypes, createClass } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { concurrent } from 'contra';
import { merge, last, omit, clone } from 'lodash';
import { FluxibleMixin } from 'fluxible-addons-react';

import Pagination from '../../../main/components/Pagination';

import VSFTransactionTable from './VSFTransactionTable';
import CategoryFilter from '../../../main/components/CategoryFilter';
import DateRangePicker from '../../../main/components/DateRangePicker';
import Searchbox from '../../../main/components/Searchbox';

import VSFTransactionStore from '../stores/VSFTransactionStore';
import fetchVSFTransactions from '../actions/fetchVSFTransactions';
import clearVSFTransaction from '../actions/clearVSFTransaction';

const SUBMIT_KEY = 13;
const PAGE_SIZE = 100;

const VSFTransactionDetails = createClass({
  contextTypes: {
    router: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [VSFTransactionStore],

    fetchData(context, params, query, done) {
      const defaultQuery = {
        fromTime: moment().subtract(2, 'day').startOf('day').format('L'),
        toTime: moment().endOf('day').format('L'),
        category: '',
        pageIndex: 0,
        pageSize: PAGE_SIZE,
        userNumber: '',
      };

      const queryAndParams = {
        carrierId: params.identity,
        fromTime: query.fromTime,
        toTime: query.toTime,
        category: query.category,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        userNumber: query.userNumber,
      };

      concurrent([
        context.executeAction.bind(context, clearVSFTransaction, {}),
        context.executeAction.bind(context, fetchVSFTransactions, merge(clone(defaultQuery), queryAndParams)),
      ], done || () => {});
    },
  },

  getInitialState() {
    const { fromTime, toTime, category, userNumber, isLoadingMore } = this.syncQueryAndState();
    const { transactions } = this.getStore(VSFTransactionStore).getData();
    return { fromTime, toTime, category, userNumber, transactions, isLoadingMore };
  },

  syncQueryAndState(newState) {
    const state = this.getStore(VSFTransactionStore).getQuery();
    const query = this.context.router.getCurrentQuery();

    const renewedState = newState ? merge(state, query, newState) : merge(state, query);
    return renewedState;
  },

  onChange() {
    const data = this.getStore(VSFTransactionStore).getData();
    this.setState(data);
  },

  componentWillUnmount() {
    this.context.executeAction(clearVSFTransaction);
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
                placeHolder="Mobile"
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
            isLoadingMore={this.state.isLoadingMore}
          />
        </div>
      </div>
    );
  },

  handleQueryChange(newQueryChange) {
    const routeName = last(this.context.router.getCurrentRoutes()).name;
    const params = this.context.router.getCurrentParams();
    const toBeSent = this.syncQueryAndState(newQueryChange);

    this.context.router.transitionTo(routeName, params, omit(toBeSent || {}, value => !value));
  },

  handlePageChange() {
    const { identity: carrierId } = this.context.router.getCurrentParams();
    const { fromTime, toTime, pageIndex, pageSize, category, userNumber } = this.state;

    this.context.executeAction(fetchVSFTransactions, {
      carrierId, fromTime, toTime, category, userNumber,
      pageIndex: +pageIndex + 1,
      pageSize: +pageSize,
    });
  },

  handleStartDateChange(date) {
    const changes = { fromTime: moment(date).startOf('day').format('L') };
    this.setState(changes);
    this.handleQueryChange(changes);
  },

  handleEndDateChange(date) {
    const changes = { toTime: moment(date).endOf('day').format('L') };
    this.setState(changes);
    this.handleQueryChange(changes);
  },

  handleNumberChange(e) {
    const changes = { userNumber: e.target.value };
    this.setState(changes);
  },

  handleSearchSubmit(e) {
    if (e.which !== SUBMIT_KEY) return;
    const changes = { userNumber: e.target.value };
    this.handleQueryChange(changes);
  },

  handleVoiceFilterToggle() {
    const changes = { category: this.state.category === 'voice_sticker' ? '' : 'voice_sticker' };
    this.setState(changes);
    this.handleQueryChange(changes);
  },

  handleAnimationFilterToggle() {
    const changes = { category: this.state.category === 'animation' ? '' : 'animation' };
    this.setState(changes);
    this.handleQueryChange(changes);
  },

  handleStickerFilterToggle() {
    const changes = { category: this.state.category === 'sticker' ? '' : 'sticker' };
    this.setState(changes);
    this.handleQueryChange(changes);
  },

  handleCreditFilterToggle() {
    const changes = { category: this.state.category === 'credit' ? '' : 'credit' };
    this.setState(changes);
    this.handleQueryChange(changes);
  },
});

export default VSFTransactionDetails;
