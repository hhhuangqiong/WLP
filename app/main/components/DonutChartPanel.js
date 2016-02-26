import React, { PropTypes } from 'react';
import classNames from 'classnames';

import DonutChart from './DonutChart';
import DonutChartLegendItem from './DonutChartLegendItem';

// colors used to render the chart
const DEFAULT_COLORS = ['#FB3940', '#F57536', '#F5A336', '#FDCF44'];

/**
 * @typedef {Object} DonutChartData
 * @property {String} name  The data item name
 * @property {Number} value  The data value
 */

/**
 * A configurable donut chart panel component.
 * This component nested the DonutChart and DonutChartLegendItem inside.
 *
 * @class DonutChartPanel
 */
export default React.createClass({
  propTypes: {
    /**
     * The chart data.
     * @type {DonutChartData[]}
     */
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    })),
    /**
     * The diameter of the chart.
     * @type Number
     */
    size: PropTypes.number,
    /**
     * The size of the gap between each slice.
     * @type Number
     */
    gapSize: PropTypes.number,
    /**
     * The text used to display as the unit of the numbers.
     * @type String
     */
    unit: PropTypes.string,
    /**
     * The array of colors to be used for each data item.
     * @type String[]
     */
    colors: PropTypes.arrayOf(PropTypes.string),
    bars: PropTypes.array,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return {
      bars: 4,
    };
  },

  getInitialState() {
    return {
      // create empty legend item as place holder
      useDummy: true,
    };
  },

  componentWillReceiveProps(nextProps) {
    // use dummy legend if no data
    this.setState({
      useDummy: !nextProps.data || nextProps.data.length === 0,
    });
  },

  renderLegendItems(data, colors) {
    // calculate the total number for percentage calculation
    const total = data.reduce((acc, d) => acc + d.value, 0);

    // sort the data so that the larger number goes first in the legend
    data.sort((a, b) => a.value < b.value);

    return data.map((method, index) => {
      const field = method.name;
      const value = method.value;

      const percentage = total ? Math.round(value / total * 100) : 0;

      return (
        <DonutChartLegendItem
          header={field}
          value={value}
          percentage={percentage}
          unit={this.props.unit}
          color={colors[index]}
        />
      );
    });
  },

  render() {
    // use default colors if not set
    const colors = this.props.colors || DEFAULT_COLORS;

    let data = [];
    if (this.state.useDummy) {
      // create initial dummy data for the UI, for the dummy empty bars
      const bars = this.props.bars;

      for (let i = 0; i < bars; i++) {
        data.push({
          name: '-',
          value: 0,
        });
      }
    } else {
      data = this.props.data;
    }

    return (
      <div className={classNames(this.props.className, 'donut-chart-panel')}>
        <DonutChart
          className="donut-chart-panel__donut-chart"
          data={data}
          unit={this.props.unit}
          size={this.props.size}
          borderWidth={this.props.gapSize}
          colors={colors}
        />

        <div className="donut-chart-panel__legend">
          {this.renderLegendItems(data, colors)}
        </div>
      </div>
    );
  },
});
