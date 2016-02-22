import Moment from 'moment';
import React from 'react';

let TimePicker = React.createClass({
  componentDidMount() {
    $(document).foundation('dropdown', 'reflow');
  },

  addHour() {
    this.props.onChange(this.props.datetime.add(1, 'h').format());
  },

  addMinute() {
    this.props.onChange(this.props.datetime.add(1, 'm').format());
  },

  subtractHour() {
    this.props.onChange(this.props.datetime.subtract(1, 'h').format());
  },

  subtractMinute() {
    this.props.onChange(this.props.datetime.subtract(1, 'm').format());
  },

  render() {
    let {datetime, format, timePickerId, className} = this.props;

    return (
      <div>
        <div
          data-dropdown={timePickerId}
          aria-controls={timePickerId}
          aria-expanded="false"
          className={className}
        >
          <span className="left date-range-picker__date-span">
            {datetime.format(format)}
          </span>
        </div>

        <div
          id={timePickerId}
          data-dropdown-content
          className="f-dropdown"
          aria-hidden="true"
          aria-autoclose="false"
          tabIndex="-1"
        >
          <table className="timepicker-dropdown-table">
            <tr>
              <td onClick={this.addHour} className="cursor-pointer">
                <strong>+</strong>
              </td>
              <td></td>
              <td onClick={this.addMinute} className="cursor-pointer">
                <strong>+</strong>
              </td>
            </tr>

            <tr className="cursor-default">
              <td>{datetime.format('H')}</td>
              <td>:</td>
              <td>{datetime.format('mm')}</td>
            </tr>

            <tr>
              <td onClick={this.subtractHour} className="cursor-pointer">
                <strong>-</strong>
              </td>
              <td></td>
              <td onClick={this.subtractMinute} className="cursor-pointer">
                <strong>-</strong>
              </td>
            </tr>
          </table>

        </div>
      </div>
    );
  }
});

export default TimePicker;
