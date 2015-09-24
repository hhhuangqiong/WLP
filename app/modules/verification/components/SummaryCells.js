import React from 'react';
import classNames from 'classnames';

const TOTAL_COLUMNS = 24;

export default React.createClass({
  displayName: 'SummaryCells',

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

    let pastAccumulatedAttempts = this.props.pastAccumulatedAttempts;
    let pastAccumulatedSuccess = this.props.pastAccumulatedSuccess;
    let pastAccumulatedFailure = this.props.pastAccumulatedFailure;
    let pastAverageSuccessRate = this.props.pastAverageSuccessRate;

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
        <section key={index} className={classNames(`large-${Math.floor(TOTAL_COLUMNS/cells.length)}`, 'columns', index !== 0 ? 'left-border' : '' )}>
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
