import React, { PropTypes } from 'react';
import moment from 'moment';

const ID_MAX = 100000;
const DEFAULT_LINE_WIDTH = 1;
const SELECTED_LINE_WIDTH = 2;
const AXIS_COLOR = '#808080';

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
 * @class LineChart
 * @see {LineChart~XAxisOpts}
 * @see {LineChart~YAxisOpts}
 * @see {LineChart~LineOpts}
 * @see {LineChart~PointOpts}
 */
export default React.createClass({
  propTypes: {
    /**
     * The option object for drawing the x-axis.
     * @type {LineChart~XAxisOpts}
     */
    xAxis: PropTypes.shape({
      title: PropTypes.string,
      start: PropTypes.number.isRequired,
      tickCount: PropTypes.number.isRequired,
      tickInterval: PropTypes.number.isRequired
    }).isRequired,
    /**
     * The option object for drawing the y-axis.
     * @type {LineChart~YAxisOpts}
     */
    yAxis: PropTypes.shape({
      title: PropTypes.string,
      unit: PropTypes.string,
      alignment: PropTypes.string,
      max: PropTypes.number
    }).isRequired,
    /**
     * The option objects for drawing the lines.
     * @type {LineChart~LineOpts[]}
     */
    lines: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string,
      selected: PropTypes.boolean,
      tooltipFormatter: PropTypes.func
    })),
    /**
     * The option objects for drawing the points.
     * @type {LineChart~PointOpts[]}
     */
    points: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    })),
    /**
     * The name of the selected line. 
     * A selected line will be thicker than normal lines.
     * Only the selected line can interact with the mouse events.
     * @type {String}
     */
    selectedLine: PropTypes.string
  },

  getInitialState: function () {
    return {
      containerId: 'line' + Math.floor(Math.random() * ID_MAX)
    };
  },

  drawChart: function (props) {
    let xAxis = props.xAxis;
    let yAxis = props.yAxis;

    // create a dummy series, so that the x-axis can be drawn while the data is loading
    let dummy = [];
    for (let i = 0; i < xAxis.tickCount; i++) {
      dummy.push(0);
    }

    // append the unit to the axis label when available
    let yAxisLabelFormatter = !yAxis.unit ? null : function () { return `${this.value}${yAxis.unit}`; };

    Highcharts.dateFormats = {
      // return the day of month in 1st, 2nd, 23rd, 25th format
      T: function (timestamp) {
        return moment(timestamp).format('Do');
      }
    };

    this.chart = new Highcharts.Chart({
      chart: {
        type: 'line',
        renderTo: this.state.containerId
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: null
      },
      subtitle: {
        text: null
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%T',
          hour: '%H:%M'
        },
        title: {
          text: xAxis.title
        },
        // show grid line
        gridLineWidth: 1,
        // create buffer at the beginning and the end of the x axis, 
        // so that the first and the last points do not lie on the y axis
        startOnTick: false,
        endOnTick: false,
        // control the size of the buffer at the beginning
        min: xAxis.start - xAxis.tickInterval,
        // the data points should be above the x-axis's ticks, not between 2 ticks
        tickmarkPlacement: 'on',
        lineColor: AXIS_COLOR
      },
      yAxis: {
        title: {
          text: yAxis.title
        },
        labels: {
          formatter: yAxisLabelFormatter
        },
        // setting floor and min to 0, avoiding the x axis being drawn in the middle of the chart
        floor: 0,
        min: 0,
        max: yAxis.max,
        // minRange controls the scale of the y axis while the chart is empty
        minRange: 80,
        lineWidth: 1,
        lineColor: AXIS_COLOR,
        // control the alignment of the y-axis, default to left
        opposite: yAxis.alignment === 'right'
      },
      series: [{
        // dummy series to enforce the draw, otherwise the chart will be blank
        data: dummy,
        // this dummy series should not interact with the mouse
        enableMouseTracking: false,
        // nor be visible
        lineWidth: 0
      }],
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          pointStart: xAxis.start,
          pointInterval: xAxis.tickInterval,
          marker: {
            // disable marker so that the data point is not explicitly drawn
            enabled: false
          }
        },
        line: {
          states: {
            hover: {
              // enforce the selected line width, otherwise the line will be even ticker when hover
              lineWidth: SELECTED_LINE_WIDTH
            }
          }
        }
      },
      tooltip: {
        // use HTML for more flexible formatting
        useHTML: true
      }
    });
  },

  /**
   * Adds a new line to the chart.
   *
   * @method
   * @param {LineChart~LineOpts} opts  The line drawing options
   */
  addLine: function (opts) {
    let tooltipOptions = opts.tooltipFormatter ? this.createCustomTooltipOptions(opts.tooltipFormatter) : {};
    let lineWidth = opts.selected ? SELECTED_LINE_WIDTH : DEFAULT_LINE_WIDTH;

    this.chart.addSeries({
      name: opts.name,
      data: opts.data,
      color: opts.color,
      lineWidth: lineWidth,
      enableMouseTracking: opts.selected,
      tooltip: tooltipOptions
    });
  },

  /**
   * Adds a new point to the chart if it doesn't exist.
   * Now we assume the same point only exist once, no duplicate points are considered.
   *
   * @method
   * @param {LineChart~PointOpts} opts  The point drawing options
   */
  addPoint: function (opts) {
    let name = `point-${opts.x}-${opts.y}`;
    let existingPoint = _.find(this.chart.series, function (series) {
      return series.name === name;
    });

    // the point already exist, do not duplicate it
    if (existingPoint) {
      return;
    }

    this.chart.addSeries({
      name: name,
      data: [[opts.x, opts.y]],
      marker: {
        enabled: true
      },
      tooltip: {
        // TODO: support formatter for point
        pointFormatter: function () {
          return `<div style="text-align: center">${this.y}</div>`;
        }
      }
    });
  },

  /**
   * Selects a line on the chart.
   *
   * @method
   * @param {Series} line  The series object from the chart
   */
  selectLine: function (line) {
    line.update({
      selected: true,
      lineWidth: SELECTED_LINE_WIDTH,
      enableMouseTracking: true
    });
  },

  /**
   * Unselects a line on the chart.
   *
   * @method
   * @param {Series} line  The series object from the chart
   */
  unselectLine: function (line) {
    line.update({
      selected: false,
      lineWidth: DEFAULT_LINE_WIDTH,
      enableMouseTracking: false
    });
  },

  /**
   * Creates a tooltip options object for the custom formatter.
   *
   * @method
   * @param {Function} formatter  The custom formatter from the consumer
   * @returns {Object} A plain object that can be used as the tooltip options
   */
  createCustomTooltipOptions: function (formatter) {
    return {
      headerFormat: '',
      footerFormat: '',
      pointFormatter: function () {
        return formatter(this.category, this.y, this.index);
      }
    };
  },

  componentDidMount: function () {
    // can only draw the chart when the x-axis is ready
    // if not drawn, it will be drawn when the x-axis data is received at componentWillReceiveProps
    if (this.props.xAxis) {
      this.drawChart(this.props);

      // if the lines are ready at the didMount time, draw them directly
      if (this.props.lines) {
        this.props.lines.forEach((lineOpts) => {
          this.drawLine(lineOpts);
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

  componentWillReceiveProps: function (nextProps) {
    // this function will be called when the user interacts with the sidebar
    // unnecessary redraw will be invoked
    // avoid unnecessary redraw
    if (_.eq(nextProps, this.props)) {
      return;
    }

    // We have to wait for the x-axis from props from parent.
    // However, child component is mounted before the parent.
    // Therefore, if the parent set the props in its componentDidMount, 
    // we cannot use componentDidMount to draw the chart.
    // Instead, we draw it inside componentWillReceiveProps, as the props must go through this.
    if ((nextProps.xAxis && !this.chart) || !_.eq(nextProps.xAxis, this.props.xAxis)) {
      this.drawChart(nextProps);
    }

    // if the chart is not drawn, do nothing
    if (!this.chart) {
      return;
    }

    // the lines are ready
    // TODO: add the line removal logic
    if (nextProps.lines) {
      nextProps.lines.forEach((lineOpts) => {
        let selected = nextProps.selectedLine && lineOpts.name === nextProps.selectedLine;

        let existingLine = _.find(this.chart.series, function (series) {
          return series.name === lineOpts.name;
        });

        // update the line if it exists
        if (existingLine) {
          (selected ? this.selectLine : this.unselectLine).call(this, existingLine);
          return;
        }

        // or add a new line if it does not
        lineOpts.selected = lineOpts.selected || selected;
        this.addLine(lineOpts);
      });
    }

    // the points are ready
    // do not support point update
    // TODO: add the point removal logic
    if (nextProps.points) {
      nextProps.points.forEach((pointOpts) => {
        this.addPoint(_.extend({ name }, pointOpts));
      });
    }
  },

  componentDidUpdate: function () {
    if (this.chart) {
      // The container may have been resized,
      // or the chart was draw in invisible node and then change to visible.
      // In either case, the chart must be reflow to fit the container size.
      this.chart.reflow();
    }
  },

  render: function () {
    return (
      <div id={this.state.containerId} className={this.props.className}></div>
    );
  }  
});
