import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import equals from 'shallow-equals';

const ID_MAX = 100000;
const DEFAULT_LINE_WIDTH = 1;
const SELECTED_LINE_WIDTH = 2;
const AXIS_COLOR = '#808080';
const MIN_Y_RANGE = 50;

/**
 * This callback is used when a tooltip is being displayed on the UI.
 * This callback should return a string for the library to render the tooltip.
 * The string can be a string representation of a sequence of HTML tags.
 *
 * @typedef {Function} LineChart~TooltipFormatter
 * @param {Number} x  The x-value of the data point (usually a timestamp)
 * @param {Number} y  The y-value of the data point
 * @param {Number} xIndex  The 0 based index of the data point in the x-dimension (i.e. 0 represents the first point)
 * @returns {String} The string representation of the tooltip
 */

/**
 * @typedef {Object} LineChart~XAxisOpts
 * @property {String} [title]  The title of the x-axis
 * @property {Number} start  The timestamp in ms for the first point of the x-axis
 * @property {Number} tickCount  The number of (initial) ticks on the x-axis
 * @property {Number} tickInterval  The number of milliseconds between each tick
 */

/**
 * @typedef {Object} LineChart~YAxisOpts
 * @property {String} [title]  The title of the y-axis
 * @property {String} [unit]  The unit of the values. This will be appended to the labels on the axis.
 * @property {String} [alignment=left]  The alignment of the y-axis. Can be "left" or "right".
 * @property {Number} max  The maximum value of the y-axis
 */

/**
 * @typedef {Object} LineChart~LineOpts
 * @property {String} name  The name of the data set. This will be used to identify the line.
 * @property {Number[]} data  The data set
 * @property {String} color  The color of the line
 * @property {Boolean} [selected=false]  Whether the line is selected by default. A selected line is thicker.
 * @property {LineChart~TooltipFormatter} [tooltipFormatter]  The callback for formatting the tooltip of a data point
 */

/**
 * @typedef {Object} LineChart~PointOpts
 * @property {Number} x  The x value of the point. Should align with the x-axis.
 * @property {Number} y  The y value of the point
 */

/**
 * A configurable line chart component.
 *
 * There is a limitation on the Highcharts, which the length and position of
 * the axis are drawn based on the data set. If there is no data (series) in the
 * chart, the axis won't be drawn (i.e. the area will be completely blank).
 * To get around of it, we add a dummy series to the chart when we first draw
 * the chart, so that we can see an empty grid system in the UI.
 * Because of this, we should not remove all series from the chart even if
 * we want to clear all lines. Instead, we remove all series but the dummy series
 * one-by-one.
 *
 * @class LineChart
 * @see {LineChart~XAxisOpts}
 * @see {LineChart~YAxisOpts}
 * @see {LineChart~LineOpts}
 * @see {LineChart~PointOpts}
 */
export default React.createClass({
  propTypes: {
    className: PropTypes.string,
    shareTooltip: PropTypes.bool,
    showLegend: PropTypes.bool,
    /**
     * The option object for drawing the x-axis.
     * @type {LineChart~XAxisOpts}
     */
    xAxis: PropTypes.shape({
      title: PropTypes.string,
      start: PropTypes.number.isRequired,
      tickCount: PropTypes.number.isRequired,
      tickInterval: PropTypes.number.isRequired,
      crosshair: PropTypes.object,
    }).isRequired,
    /**
     * The option objects for drawing the y-axis.
     * @type {LineChart~YAxisOpts[]}
     */
    yAxis: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      unit: PropTypes.string,
      alignment: PropTypes.string,
      max: PropTypes.number,
      visible: PropTypes.bool,
    })).isRequired,
    /**
     * The option objects for drawing the lines.
     * @type {LineChart~LineOpts[]}
     */
    lines: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string,
      legendIndex: PropTypes.number,
      lineWidth: PropTypes.number,
      selected: PropTypes.bool,
      symbol: PropTypes.oneOf(['circle', 'sqaure', 'diamond', 'triangle', 'triangle-down']),
      tooltipFormatter: PropTypes.func,
      tooltip: PropTypes.object,
      // check only for line & column
      // @See: http://api.highcharts.com/highcharts#series
      type: PropTypes.oneOf(['line', 'column']).isRequired,
      yAxis: PropTypes.number,
      zIndex: PropTypes.number,
    })),
    /**
     * The option objects for drawing the points.
     * @type {LineChart~PointOpts[]}
     */
    points: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })),
    /**
     * The name of the selected line.
     * A selected line will be thicker than normal lines.
     * Only the selected line can interact with the mouse events.
     * @type {String}
     */
    selectedLine: PropTypes.string,
  },

  getInitialState() {
    return {
      containerId: 'line' + Math.floor(Math.random() * ID_MAX),
    };
  },

  componentDidMount() {
    // can only draw the chart when the x-axis is ready
    // if not drawn, it will be drawn when the x-axis data is received at componentWillReceiveProps
    if (this.props.xAxis) {
      this.drawChart(this.props);

      // if the lines are ready at the didMount time, draw them directly
      if (this.props.lines) {
        this.props.lines.forEach((lineOpts) => {
          this.addSeries(lineOpts);
        });
      }

      // if the points are ready at the didMount time, draw them directly
      if (this.props.points) {
        this.props.points.forEach((pointOpts) => {
          this.addPoint(pointOpts);
        });
      }
    }
  },

  componentWillReceiveProps(nextProps) {
    // in this case, we assumed that when updating the chart,
    // the parent component will first clear the existing data,
    // and then re-assigned with the new data
    // this state will be used to determine whether the chart should be redraw
    // within the updateChart function below
    this.setState({
      isDataChanging: !this.props.lines && nextProps.lines || !nextProps.lines && this.props.lines
    })
  },

  shouldComponentUpdate(nextProps) {
    return !_.eq(nextProps, this.props);
  },

  componentWillUpdate(nextProps) {
    // We have to wait for the x-axis from props from parent.
    // However, child component is mounted before the parent.
    // Therefore, if the parent set the props in its componentDidMount,
    // we cannot use componentDidMount to draw the chart.
    // Instead, we draw it inside componentWillReceiveProps, as the props must go through this.
    if ((nextProps.xAxis && !this.chart) || !_.eq(nextProps.xAxis, this.props.xAxis)) {
      this.drawChart(nextProps);
    }
  },

  componentDidUpdate() {
    // The container may have been resized,
    // or the chart was draw in invisible node and then change to visible.
    // In either case, the chart must be reflow to fit the container size.
    if (this.chart) this.chart.reflow();
  },

  render() {
    this.updateChart();
    return <div id={this.state.containerId} className={this.props.className}></div>;
  },

  drawChart(props) {
    const xAxis = props.xAxis;
    const yAxis = props.yAxis;

    // create a dummy series, so that the x-axis can be drawn while the data is loading
    const dummy = [];

    for (let i = 0; i < xAxis.tickCount; i++) {
      // If all data are zero, the y-axis will not be drawn normally.
      // Pushing mnon-zero values to avoid x-axis being placed in the middle of the chart.
      dummy.push(10);
    }

    // append the unit to the axis label when available
    const yAxisLabelFormatter = function yAxisLabelFormatter(unit) { return !unit ? `${this.value}` : `${this.value}${unit}`; };

    Highcharts.dateFormats = {
      // return the day of month in 1st, 2nd, 23rd, 25th format
      T: (timestamp) => moment(timestamp).format('Do'),
    };

    // use local time
    Highcharts.setOptions({
      global: { useUTC: false },
    });

    this.chart = new Highcharts.Chart({
      chart: {
        // When using multiple axis, the ticks of two or more opposite axes will
        // automatically be aligned by adding ticks to the axis or axes with the least ticks.
        alignTicks: !_.isUndefined(props.alignTicks) ? props.alignTicks : true,
        // tends to keep the default height
        height: props.height || null,
        // Give enough space to the horizontal dimension, so that the y-axis
        // will not move when the number of digits in the y-axis labels change
        marginLeft: props.marginLeft || 50,
        marginRight: props.marginRight || 50,
        // That's almost a fixed amount, unless there are too much series that
        // makes a two-row legend
        marginTop: props.showLegend ? 50 : 0,
        renderTo: this.state.containerId
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false,
      },
      title: {
        text: null,
      },
      subtitle: {
        text: null
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%d %b',
          hour: '%H:%M'
        },
        title: {
          text: xAxis.title,
        },
        // show grid line
        gridLineWidth: 1,
        // create buffer at the beginning and the end of the x axis,
        // so that the first and the last points do not lie on the y axis
        startOnTick: false,
        endOnTick: false,
        // the data points should be above the x-axis's ticks, not between 2 ticks
        tickmarkPlacement: 'on',
        lineColor: AXIS_COLOR,
        crosshair: xAxis.crosshair || null,
        events: {
          afterSetExtremes: function() {
            // if xAxis crosshair is defined,
            // dynamically set the width as the width of column
            // (highlighting the whole column rather than a thin line)
            // unless the width is predefined
            if (xAxis.crosshair) {
              this.crosshair = {
                color: xAxis.crosshair.color,
                width: xAxis.crosshair.width || (this.width / (this.series[0].points.length-1))
              }
            }
          }
        }
      },
      yAxis: _.reduce(yAxis, (result, axis) => {
        result.push(
          {
            title: {
              text: axis.title,
            },
            labels: {
              // allow to use custom formatter
              // while global label formatter assumes that
              // the yAxis unit is always the same as data unit
              formatter: _.get(axis, 'labels.formatter') || _.partial(yAxisLabelFormatter, axis.unit),
            },
            // do not allow decimal labels (e.g. 12.5)
            allowDecimals: false,
            // set min to 0, avoiding the labels for smaller values being skipped when all data are big
            min: 0,
            max: axis.max,
            // minRange controls the minimum range of the y axis
            minRange: MIN_Y_RANGE,
            lineWidth: 1,
            lineColor: AXIS_COLOR,
            // control the alignment of the y-axis, default to left
            opposite: axis.alignment === 'right',
            tickInterval: axis.tickInterval || null,
            ceiling: axis.unit === '%' ? 100 : null,
            visible: !_.isUndefined(axis.visible) ? axis.visible : true
          }
        );
        return result;
      }, []),
      series: [{
        // dummy series should never be displayed on Legend
        showInLegend: false,
        // dummy series to enforce the draw, otherwise the chart will be blank
        data: dummy,
        // this dummy series should not interact with the mouse
        enableMouseTracking: false,
        // nor be visible
        lineWidth: 0,
      }],
      legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'top',
        borderWidth: 0,
        symbolWidth: 40,
        symbolRadius: 4,
        symbolHeight: 8,
        symbolPadding: 15,
        itemMarginBottom: 10,

        // As the legends are not clickable in our charts
        // the hover style is set to `normal` from `pointer` by default
        itemHoverStyle: {
          cursor: 'normal'
        }
      },
      plotOptions: {
        series: {
          pointStart: xAxis.start,
          pointInterval: xAxis.tickInterval,
          marker: {
            // disable marker so that the data point is not explicitly drawn
            enabled: false,
          },
          events: {
            // had an issue that toggling on/off a series makes the charts
            // have no yAxis, so until we have a full solution, we will
            // disable the legend toggle function for Combination Charts
            legendItemClick: function(e) {
              e.preventDefault();
              return false;
            }
          }
        },
        line: {
          states: {
            hover: {
              // enforce the selected line width, otherwise the line will be even ticker when hover
              lineWidth: SELECTED_LINE_WIDTH,
            },
          },
        },
      },
      tooltip: {
        // use HTML for more flexible formatting
        useHTML: true,
        shared: props.shareTooltip || false,
        dateTimeLabelFormats: {
          day: '%d %b %Y',
          hour: '%H:%M %d %b %Y'
        }
      },
    });
  },

  /**
   * Adds a new series to the chart.
   *
   * @method
   * @param {LineChart~LineOpts} opts  The line drawing options
   */
  addSeries(opts) {
    const tooltipOptions = opts.tooltipFormatter ? this.createCustomTooltipOptions(opts.tooltipFormatter) : {};
    const {
      borderColor,
      borderWidth,
      color,
      data,
      index,
      legendIndex,
      lineWidth,
      name,
      selected,
      symbol,
      tooltip,
      type,
      yAxis,
      zIndex
    } = opts;

    let typeOption = {};
    let series = {
      type,
      name,
      data,
      color,
      index,
      legendIndex,
      // use the first yAxis by default
      yAxis: yAxis || 0,
      zIndex: zIndex || 0,
      // default selected to false
      // and let this to be overwritten by the type option below
      selected: false,
      enableMouseTracking: selected,
      tooltip: tooltip,
      tooltipOptions: tooltipOptions
    };

    switch(type) {
      // TODO: add support to other types if needed
      case 'line':
        typeOption = {
          lineWidth: lineWidth || DEFAULT_LINE_WIDTH,
          marker: {
            lineWidth: lineWidth || DEFAULT_LINE_WIDTH,
            lineColor: color,
            fillColor: 'white',
            symbol: symbol
          },
          pointPadding: 0,
          selected: true
        };
        break;

      case 'column':
        typeOption = {
          pointPadding: 0.2,
          borderColor: borderColor || opts.color,
          borderWidth: borderWidth || 0
        };
        break;
    }

    this.chart.addSeries(_.merge(series, typeOption));
  },

  /**
   * Remove a series from the chart.
   *
   * @method
   * @param {Series} series  The Highcharts series object to remove
   * @see {@link http://api.highcharts.com/highcharts#Series.remove}
   */
  removeSeries(series) {
    series.remove();
  },

  /**
   * Adds a new point to the chart if it doesn't exist.
   * Now we assume the same point only exist once, no duplicate points are considered.
   *
   * @method
   * @param {LineChart~PointOpts} opts  The point drawing options
   */
  addPoint(opts) {
    const name = `point-${opts.x}-${opts.y}`;
    const existingPoint = _.find(this.chart.series, series => series.name === name);

    // the point already exist, do not duplicate it
    if (existingPoint) return;

    this.chart.addSeries({
      name: name,
      data: [[opts.x, opts.y]],
      marker: {
        enabled: true,
      },
      tooltip: {
        // TODO: support formatter for point
        pointFormatter() {
          return `<div style="text-align: center">${this.y}</div>`;
        },
      },
    });
  },

  /**
   * Selects a line on the chart.
   *
   * @method
   * @param {Series} line  The series object from the chart
   */
  selectLine(line) {
    line.update({
      selected: true,
      lineWidth: SELECTED_LINE_WIDTH,
      enableMouseTracking: true,
    });
  },

  /**
   * Unselects a line on the chart.
   *
   * @method
   * @param {Series} line  The series object from the chart
   */
  unselectLine(line) {
    line.update({
      selected: false,
      lineWidth: DEFAULT_LINE_WIDTH,
      enableMouseTracking: false,
    });
  },

  /**
   * Creates a tooltip options object for the custom formatter.
   *
   * @method
   * @param {Function} formatter  The custom formatter from the consumer
   * @returns {Object} A plain object that can be used as the tooltip options
   */
  createCustomTooltipOptions(formatter) {
    return {
      headerFormat: '',
      footerFormat: '',
      pointFormatter: function pointFormatter() {
        return formatter(this.category, this.y, this.index);
      },
    };
  },

  updateChart() {
    if (!this.chart || !this.state.isDataChanging) {
      return;
    }

    // the lines are ready
    // TODO: add the line removal logic
    if (this.props.lines) {
      this.props.lines.forEach((lineOpts, lineIndex) => {
        const selected = this.props.selectedLine && lineOpts.name === this.props.selectedLine;

        const existingLine = _.find(this.chart.series, series => series.name === lineOpts.name);

        // remove the line if it exists
        if (existingLine) {
          this.removeSeries(existingLine);
        }

        // and add the lines with updated options
        lineOpts.selected = lineOpts.selected || selected;
        this.addSeries(lineOpts);
      });
    } else {
      // TODO: add the individual line removal logic
      // remove all lines except the dummy (series[0])
      _.rest(this.chart.series).forEach(this.removeSeries);
    }

    // the points are ready
    // do not support point update
    // TODO: add the point removal logic
    if (this.props.points) {
      this.props.points.forEach((pointOpts) => {
        this.addPoint(_.extend({ name }, pointOpts));
      });
    }
  },
});
