import React from 'react';
import classNames from 'classnames';

const TOTAL_COLUMNS = 24;

export default React.createClass({
  displayName: 'SummaryCells',

  /**
   * Returns the percentage change of 2 values.
   *
   * @method
   * @param {Number} prevValue  The previous value
   * @param {Number} value  The current value
   * @returns {Number} The percentage change
   */
  percentageChanges(prevValue, value) {
    return Math.round(((value - prevValue) / prevValue) * 100);
  },

  /**
   * Returns the value changed.
   *
   * @method
   * @param {Number} prevValue  The previous value
   * @param {Number} value  The current value
   * @returns {Number} The value difference
   */
  numberChanges(prevValue, value) {
    return value - prevValue;
  },

  /**
   * Returns a string for the change icon display.
   *
   * @method
   * @param {Number} change  The value changed
   * @param {Boolean} isPositiveGood  Indicate whether a positive change is good
   * @returns {String} Empty string if no change, "up" for good change, "down" for bad change
   */
  getChangesStatus(change, isPositiveGood) {
    // NaN or 0 will both go into this case
    if (!change) {
      return '';
    }

    return (change > 0 && isPositiveGood) ? 'positive' : 'negative';
  },

  prepareCellsMetadata() {
    let accumulatedAttempts = this.props.accumulatedAttempts;
    let accumulatedSuccess = this.props.accumulatedSuccess;
    let accumulatedFailure = this.props.accumulatedFailure;
    let averageSuccessRate = this.props.averageSuccessRate;

    let pastAccumulatedAttempts = this.props.pastAccumulatedAttempts;
    let pastAccumulatedSuccess = this.props.pastAccumulatedSuccess;
    let pastAccumulatedFailure = this.props.pastAccumulatedFailure;
    let pastAverageSuccessRate = this.props.pastAverageSuccessRate;

    let constructChangeText = (numberChange, percentageChange) => {
      let percentageText = Number.isFinite(percentageChange) ? Math.abs(percentageChange) : '-';
      return `${Math.abs(numberChange)} (${percentageText}%)`;
    }

    let computeTrend = (prevValue, value, isPositiveGood) => {
      let numberChange = this.numberChanges(prevValue, value);
      let percentageChange = this.percentageChanges(prevValue, value);
      let status = this.getChangesStatus(numberChange, isPositiveGood);
      let direction = numberChange > 0 ? 'up' : 'down';

      return {
        numberChange,
        percentageChange,
        status,
        direction
      };
    };

    let cellMetadataList = [];
    let trend;

    // Total number of verification attempts
    trend = computeTrend(pastAccumulatedAttempts, accumulatedAttempts, true);

    cellMetadataList.push({
      title: 'Total number of verification attempts',
      value: accumulatedAttempts,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange)
      }
    });

    // Total number of success verification
    trend = computeTrend(pastAccumulatedSuccess, accumulatedSuccess, true);

    cellMetadataList.push({
      title: 'Total number of success verification',
      value: accumulatedSuccess,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange)
      }
    });

    // Number of failure verification
    trend = computeTrend(pastAccumulatedFailure, accumulatedFailure, false);

    cellMetadataList.push({
      title: 'Number of failure verification',
      value: accumulatedFailure,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange)
      }
    });

    // Average success rate
    trend = computeTrend(pastAverageSuccessRate, averageSuccessRate, true);

    cellMetadataList.push({
      title: 'Average success rate',
      value: `${Math.round(averageSuccessRate)}%`,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: `${Math.abs(Math.round(trend.numberChange))}%`
      }
    });

    return cellMetadataList;
  },

  renderCells(cellMetadataList) {
    return cellMetadataList.map((cell, index) => {
      return (
        <section key={index} className={classNames(`large-${Math.floor(TOTAL_COLUMNS/cellMetadataList.length)}`, 'columns', index !== 0 ? 'left-border' : '' )}>
          <div className="verification-overview__title">{cell.title}</div>
          <div className="verification-overview__value">{cell.value}</div>
          <div className={classNames('verification-overview__changes', cell.changes.status, cell.changes.direction, { hide: !cell.changes.status })}>
            <span className="arrow"></span>
            <span>{cell.changes.text}</span>
          </div>
        </section>
      );
    });
  },

  render() {
    return (
      <div>
        {this.renderCells(this.prepareCellsMetadata())}
      </div>
    );
  }
});
