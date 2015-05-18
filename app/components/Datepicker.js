
'use strict'
var React = require('react');
var moment = require('moment')

var Picker = React.createClass({
  getDefaultProps: function() {
    return {
      minDate:new Date(2007, 1 - 1, 1),
      inputClass:"datepickerInput",
      inputName:"datepickerFeild"
    };
  },
  getInitialState:function(){
    return{value:""}
  },
  handleDatePickerChange: function (event){
    this.setState({value:event.target.value})
  },
  componentDidMount: function () {
    var textBoxId = this.props.inputClass;
    var minDate = this.props.minDate
    var maxDate = this.props.maxDate
    $("." + textBoxId).datepicker({
      minDate: minDate,
      maxDate:"+1m +1w"
    });
  },
  render: function() {
    console.log("render datepicker");
    return (
      <div className='row'>
        <div className="small-10 small-centered columns text-center">
          <input type='text' value={this.state.value} className={this.props.inputClass} name={this.props.inputName}  onChange={this.handleDatePickerChange}/>
        </div>
      </div>
    );
  }
});
export default Picker;
