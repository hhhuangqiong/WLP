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
    borderWidth: PropTypes.number,
    /**
     * The unit to be shown under the numeric title.
     * @type {String}
     */
    unit: PropTypes.string,
    /**
     * The colors to use for the slices.
     * The first color is used for the biggest data.
     * @type {String[]}
     */
    colors: PropTypes.arrayOf(PropTypes.string),
    /**
     * The chart data.
     * The chart is drawn in anti-clockwise, bigger data always goes first.
     * @type {Object}
     */
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    })),
  },

  getInitialState() {
    return {
      containerId: 'donut' + Math.floor(Math.random() * ID_MAX),
    };
  },

  getDefaultProps() {
    return {
      size: 200,
      width: 7,
      borderWidth: 5,
    };
  },

  componentDidMount() {
    const size = this.props.size;
    const width = this.props.width;
    const borderWidth = this.props.borderWidth;

    this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.state.containerId,
        height: size + borderWidth * 2,
      },
      exporting: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: '0',
        align: 'center',
        verticalAlign: 'middle',
        y: 5,
        style: {
          'fontSize': '1.5rem',
        },
      },
      subtitle: {
        text: this.props.unit,
        align: 'center',
        verticalAlign: 'middle',
        y: 22,
        style: {
          'color': '#888',
          'fontSize': '0.7rem',
        },
      },
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false,
          },
          startAngle: 0,
          endAngle: 360,
          center: ['50%', '50%'],
        },
        series: {
          // no animation for the initial plot, otherwise the background will animate...
          animation: false,
        },
      },
      // default series as the donut background
      series: [{
        type: 'pie',
        enableMouseTracking: false,
        innerSize: size - width - borderWidth,
        size: size,
        borderWidth: 0,
        colors: [BACKGROUND_COLOR],
        data: [1],
      }],
    });
  },

  componentWillReceiveProps(nextProps) {
    // this function will be called when the user interacts with the sidebar
    // unnecessary redraw will be invoked
    // avoid unnecessary redraw
    if (_.eq(nextProps, this.props)) return;

    const size = this.props.size || DEFAULT_SIZE;
    const width = this.props.width || DEFAULT_WIDTH;
    const borderWidth = this.props.borderWidth || DEFAULT_BORDER_WIDTH;

    const total = nextProps.data.reduce(function(acc, d) {
      return acc + d.value;
    }, 0);

    const chartData = nextProps.data.map(function(d) {
      return d.value;
    });

    // bigger data goes first
    chartData.sort((a, b) => a > b);

    // the chart goes anti-clockwise, but the colors go clockwise
    // therefore we extract the colors we need then reverse them
    const colors = this.props.colors.slice(0, chartData.length).reverse();

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
        colors: colors,
        data: chartData,
      });
    } else {
      // otherwise, update the existing data set
      this.chart.series[1].setData(chartData);
    }

    this.chart.setTitle({
      text: total || '0',
    });
  },

  render() {
    const className = classNames(this.props.className, 'donut-chart');

    return (
      <div id={this.state.containerId} className={className}></div>
    );
  },
});
