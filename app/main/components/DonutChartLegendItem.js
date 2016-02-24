import React, { PropTypes } from 'react';
import HorizontalGauge from './HorizontalGauge';

/**
 * A legend item designed to show the numeric value and the percentage with respects to the total.
 * A horizontal gauge will be used as a graphical presentable of the percentage.
 *
 * @class DonutChartLegendItem
 */
export default React.createClass({
  propTypes: {
    /**
     * The text for the header.
     * @type {String}
     */
    header: PropTypes.string.isRequired,
    /**
     * The percentage of the value with respects to the total number.
     * @type {Number}
     */
    percentage: PropTypes.number.isRequired,
    /**
     * The numeric value.
     * @type {Number}
     */
    value: PropTypes.number.isRequired,
    /**
     * The color for the gauge.
     * @type {String}
     */
    color: PropTypes.string.isRequired,
    /**
     * The unit of the numeric value.
     * @type {String}
     */
    unit: PropTypes.string,
  },

  render() {
    return (
      <div className="donut-legend-item">
        <div>
          <div className="donut-legend-item__header">
            {this.props.header}
          </div>
          <div className="donut-legend-item__percentage" style={{ color: this.props.color }}>
            {this.props.percentage}%
          </div>
        </div>

        <div style={{ clear: 'both' }}>
          <HorizontalGauge
            className="donut-legend-item__gauge"
            percentage={this.props.percentage}
            color={this.props.color} />

          <div className="donut-legend-item__value">
            {this.props.value} {this.props.unit}
          </div>
        </div>
      </div>
    );
  },
});
