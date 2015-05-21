import React from 'react';
import moment from 'moment';

/**
 * example use
 *
 * import DatePicker from './DatePicker';
 *
 * render: function() {
 *   return (
 *     <DatePicker
 *       minDate=""
 *       inputClass=""
 *       inputName=""
 *     />
 *   )
 * };
 */

var Picker = React.createClass({
  getDefaultProps: function() {
    let minDate = moment();

    return {
      minDate: new Date(2007, 1-1, 1),
      maxDate: new Date(2017, 1-1, 1),
      inputClass: "datepickerInput",
      inputName: "datepickerFeild"
    };
  },

  getInitialState: function() {
    return { value: null }
  },

  handleDatePickerChange: function(event) {
    this.setState({ value: event.target.value })
  },

  componentDidMount: function() {
    var textBoxId = this.props.inputClass;
    var minDate = this.props.minDate;
    var maxDate = this.props.maxDate;

    React.findDOMNode(this.refs.datepicker).datepicker({
      minDate: minDate,
      maxDate: maxDate,
      beforeShow: function(input, inst)
      {
        inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
      }
    });
  },

  render: function() {
    return (
      <div className="row">
        <div className="small-10 small-centered columns text-center">
          <input
            ref="datepicker"
            type="text"
            name={this.props.inputName}
            className={this.props.inputClass}
            value={this.state.value}
            onChange={this.handleDatePickerChange
          }/>
        </div>
      </div>
    );
  }
});

export default Picker;
