import React from 'react';
import classNames from 'classnames';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import fetchVerificationPastAttempts from '../actions/fetchVerificationPastAttempts';
import VerificationOverviewStore from '../stores/VerificationOverviewStore';

import { subtractTime } from '../../../server/utils/StringFormatter';

export default React.createClass({
  displayName: 'SummaryCells',

  mixins: [FluxibleMixin, AuthMixin],

  statics: {
    storeListeners: [VerificationOverviewStore]
  },

  onChange() {
    let pastSummaryData = this.getStore(VerificationOverviewStore).getPastSummaryData();
    this.setState(pastSummaryData);
  },

  getInitialState() {
    return {
      pastAccumulatedAttempts: 0,
      pastAccumulatedSuccess: 0,
      pastAccumulatedFailure: 0,
      pastAverageSuccessRate: 0
    };
  },

  componentDidMount() {
    this.executeAction(fetchVerificationPastAttempts, {
      fromTime: subtractTime(this.props.toTime, this.props.timeRange),
      toTime: this.props.toTime
    });
  },

  percentageChanges(numberA, numberB) {
    if (!(numberA && numberB)) return 0;
    return Math.floor((numberA/numberB) * 100);
  },

  numberChanges(numberA, numberB) {
    if (!(numberA && numberB)) return 0;
    return Math.floor(Math.abs(numberA - numberB));
  },

  getChangesStatus(numberA, numberB) {
    if (!(numberA && numberB)) return '';
    return numberA > numberB ? 'up' : 'down';
  },

  renderCells() {
    let accumulatedAttempts = this.props.accumulatedAttempts;
    let accumulatedSuccess = this.props.accumulatedSuccess;
    let accumulatedFailure = this.props.accumulatedFailure;
    let averageSuccessRate = this.props.averageSuccessRate;

    let pastAccumulatedAttempts = this.state.pastAccumulatedAttempts;
    let pastAccumulatedSuccess = this.state.pastAccumulatedSuccess;
    let pastAccumulatedFailure = this.state.pastAccumulatedFailure;
    let pastAverageSuccessRate = this.state.pastAverageSuccessRate;

    let cells = [
     {
       title: 'Total number of verification attempts',
       value: accumulatedAttempts,
       changes: {
         status: this.getChangesStatus(accumulatedAttempts, pastAccumulatedAttempts),
         value: `${this.numberChanges(accumulatedAttempts, pastAccumulatedAttempts)} (${this.percentageChanges(accumulatedAttempts, pastAccumulatedAttempts)}%)`
       }
     },
     {
       title: 'Total number of success verification',
       value: accumulatedSuccess,
       changes: {
         status: this.getChangesStatus(accumulatedSuccess, pastAccumulatedSuccess),
         value: `${this.numberChanges(accumulatedSuccess, pastAccumulatedSuccess)} (${this.percentageChanges(accumulatedSuccess, pastAccumulatedSuccess)}%)`
       }
     },
     {
       title: 'Number of failure verification',
       value: accumulatedFailure,
       changes: {
         status: this.getChangesStatus(accumulatedFailure, pastAccumulatedFailure),
         value: `${this.numberChanges(accumulatedFailure, pastAccumulatedFailure)} (${this.percentageChanges(accumulatedFailure, pastAccumulatedFailure)}%)`
       }
     },
     {
       title: 'Average success rate',
       value: `${Math.floor(averageSuccessRate)}%`,
       changes: {
         status: this.getChangesStatus(averageSuccessRate, pastAverageSuccessRate),
         value: `${this.numberChanges(averageSuccessRate, pastAverageSuccessRate)}%`
       }
     }
    ];

    return cells.map((cell, index) => {
      return (
        <section key={index} className={classNames('large-6', 'columns', index !== 0 ? 'left-border' : '' )}>
          <div className="verification-overview__title">{cell.title}</div>
          <div className="verification-overview__value">{cell.value}</div>
          <div className={classNames('verification-overview__changes', cell.changes.status, { hide: !cell.changes.status })}>
            <span className="arrow"></span>
            <span>{cell.changes.value}</span>
          </div>
        </section>
      );
    });
  },

  render() {
    return (
      <div>
        {this.renderCells()}
      </div>
    );
  }
});
