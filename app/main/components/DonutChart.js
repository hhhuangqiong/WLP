import React, { PropTypes } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

const ID_MAX = 100000;
const BACKGROUND_COLOR = '#D8D8D8';

/**
 * A configurable donut chart component.
 *
 * @class DonutChart
 */
export default React.createClass({
  propTypes: {
    /**
     * The diameter of the chart.
     * Default to 200.
     * @type {Number}
     */
    size: PropTypes.number,
    /**
     * The width of the donut.
     * Default to 7.
     * @type {Number}
     */
    width: PropTypes.number,
    /**
     * The width of the donut border. 
     * This affect the gap between each slice and the actual width of the donut (width + 2 * borderWidth).
     * Default to 5.
     * @type {Number}
     */
    borderWidth: PropTypes.number
  },

  getInitialState: function () {
    return {
      containerId: 'donut' + Math.floor(Math.random() * ID_MAX)
    };
  },

  getDefaultProps: function () {
    return {
      size: 200,
      width: 7,
      borderWidth: 5
    };
  },

  componentDidMount: function () {
    let size = this.props.size;
    let width = this.props.width;
    let borderWidth = this.props.borderWidth;

    this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.state.containerId,
        height: size + borderWidth * 2
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: '0',
        align: 'center',
        verticalAlign: 'middle',
        y: 5,
        style: {
          'fontSize': '1.5rem'
        }
      },
      subtitle: {
        text: this.props.unit,
        align: 'center',
        verticalAlign: 'middle',
        y: 22,
        style: {
          'color': '#888',
          'fontSize': '0.7rem'
        }
      },
      tooltip: {
        enabled: false
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false
          },
          startAngle: 0,
          endAngle: 360,
          center: ['50%', '50%']
        },
        series: {
          // no animation for the initial plot, otherwise the background will animate...
          animation: false
        }
      },
      // default series as the donut background
      series: [{
        type: 'pie',
        enableMouseTracking: false,
        innerSize: size - width - borderWidth,
        size: size,
        borderWidth: 0,
        colors: [BACKGROUND_COLOR],
        data: [1]
      }]
    });
  },

  componentWillReceiveProps: function (nextProps) {
    // this function will be called when the user interacts with the sidebar
    // unnecessary redraw will be invoked
    // avoid unnecessary redraw
    if (_.eq(nextProps, this.props)) {
      return;
    }

    let size = this.props.size || DEFAULT_SIZE;
    let width = this.props.width || DEFAULT_WIDTH;
    let borderWidth = this.props.borderWidth || DEFAULT_BORDER_WIDTH;

    let total = nextProps.data.reduce(function (acc, d) {
      return acc + d.value;
    }, 0);

    let chartData = nextProps.data.map(function (d) {
      return d.value;
    });

    chartData.sort(function (a, b) {
      return a > b;
    });

    // if the actual data hasn't been set yet,
    // add a new series to display the data set
    if (this.chart.series.length === 1) {
      this.chart.addSeries({
        animation: true,
        type: 'pie',
        enableMouseTracking: false,
        innerSize: size - width - borderWidth * 2,
        size: size + borderWidth,
        borderWidth: borderWidth,
        colors: this.props.colors,
        data: chartData
      });
    }
    // otherwise, update the existing data set
    else {
      this.chart.series[1].setData(chartData);
    }

    this.chart.setTitle({
      text: total || '0'
    });
  },

  render: function () {
    let className = classNames(this.props.className, 'donut-chart');

    return (
      <div id={this.state.containerId} className={className}></div>
    );
  }
});
