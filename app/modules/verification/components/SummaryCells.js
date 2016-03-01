import React, { PropTypes } from 'react';
import classNames from 'classnames';

const TOTAL_COLUMNS = 24;

export default React.createClass({
  displayName: 'SummaryCells',

  propTypes: {
    accumulatedAttempts: PropTypes.number,
    accumulatedSuccess: PropTypes.number,
    accumulatedFailure: PropTypes.number,
    averageSuccessRate: PropTypes.number,
    pastAccumulatedAttempts: PropTypes.number,
    pastAccumulatedSuccess: PropTypes.number,
    pastAccumulatedFailure: PropTypes.number,
    pastAverageSuccessRate: PropTypes.number,
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

  prepareCellsMetadata() {
    const accumulatedAttempts = this.props.accumulatedAttempts;
    const accumulatedSuccess = this.props.accumulatedSuccess;
    const accumulatedFailure = this.props.accumulatedFailure;
    const averageSuccessRate = this.props.averageSuccessRate;

    const pastAccumulatedAttempts = this.props.pastAccumulatedAttempts;
    const pastAccumulatedSuccess = this.props.pastAccumulatedSuccess;
    const pastAccumulatedFailure = this.props.pastAccumulatedFailure;
    const pastAverageSuccessRate = this.props.pastAverageSuccessRate;

    const constructChangeText = (numberChange, percentageChange) => {
      const percentageText = isFinite(percentageChange) ? Math.abs(percentageChange) : ' - ';
      return `${Math.abs(numberChange)} (${percentageText}%)`;
    };

    const computeTrend = (prevValue, value, isPositiveGood) => {
      const numberChange = this.numberChanges(prevValue, value);
      const percentageChange = this.percentageChanges(prevValue, value);
      const status = this.getChangesStatus(numberChange, isPositiveGood);
      const direction = numberChange > 0 ? 'up' : 'down';

      return {
        numberChange,
        percentageChange,
        status,
        direction,
      };
    };

    const cellMetadataList = [];
    let trend;

    // Total number of verification attempts
    trend = computeTrend(pastAccumulatedAttempts, accumulatedAttempts, true);

    cellMetadataList.push({
      title: 'Total number of verification attempts',
      value: accumulatedAttempts,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange),
      },
    });

    // Total number of success verification
    trend = computeTrend(pastAccumulatedSuccess, accumulatedSuccess, true);

    cellMetadataList.push({
      title: 'Total number of success verification',
      value: accumulatedSuccess,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange),
      },
    });

    // Number of failure verification
    trend = computeTrend(pastAccumulatedFailure, accumulatedFailure, false);

    cellMetadataList.push({
      title: 'Number of failure verification',
      value: accumulatedFailure,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: constructChangeText(trend.numberChange, trend.percentageChange),
      },
    });

    // Average success rate
    trend = computeTrend(pastAverageSuccessRate, averageSuccessRate, true);

    cellMetadataList.push({
      title: 'Average success rate',
      value: `${Math.round(averageSuccessRate)}%`,
      changes: {
        status: trend.status,
        direction: trend.direction,
        text: `${Math.abs(Math.round(trend.numberChange))}%`,
      },
    });

    return cellMetadataList;
  },

  renderCells(cellMetadataList) {
    return cellMetadataList.map((cell, index) =>
      (
        <section
          key={index}
          className={classNames(
            `large-${Math.floor(TOTAL_COLUMNS / cellMetadataList.length)}`,
            'columns',
            index !== 0 ? 'left-border' : ''
          )}
        >
          <div className="verification-overview__title">{cell.title}</div>
          <div className="verification-overview__value">{cell.value}</div>
          <div className={classNames(
            'verification-overview__changes',
            cell.changes.status,
            cell.changes.direction,
            { hide: !cell.changes.status })}
          >
            <span className="arrow"></span>
            <span>{cell.changes.text}</span>
          </div>
        </section>
      )
    );
  },

  render() {
    return (
      <div>
        {this.renderCells(this.prepareCellsMetadata())}
      </div>
    );
  },
});
