
'use strict'
var React = require('react');
var DatePicker = require('react-date-picker');
var moment = require('moment')
var assign = require('object-assign')

var Picker = React.createClass({
  getDefaultProps: function() {
    return {
      dateFormat: 'YYYY-MM-DD'
    };
  },
  getInitialState:function(){
    return{date:Date.now()}
  },
  componentDidMount:function(){
    var datepicker =$('.date-picker')
    var targetInput =$('.datepicker__input')
    targetInput.on('focus',function(event){
      datepicker.show();
      datepicker.mouseover(function() {
        datepicker.show();
      })
      .mouseout(function() {
        datepicker.hide();
      });
    })

  },
  displayEvent:function(event){

  },
  onChange:function(dateString, moment){
    this.setState({
      date: dateString
    });
  },
  render: function(){
    var date = this.state.date;
    var today = Date.now();
    var myStyle = {"display":"none"}
    return (
      <div className='row'>
        <div className='large-10 large-centered column'>
            <div className="row collapse postfix-round">
              <div className="small-9 columns">
                <input
                  ref="input"
                  type="text"
                  value={moment(this.state.date).format('DD/MM/YYYY')}
                  onFocus={this.handleFocus}
                  className="datepicker__input"
                  placeholder="Please select date" />
              </div>
            </div>
          <DatePicker
            ref="datepicker"
            minDate='2000-04-04'
            maxDate={today}
            date={date}
            onChange={this.onChange}
            hideFooter='true'
            navOnDateClick='false'
            style={myStyle}
            />
          </div>
      </div>

    )
  }
});
export default Picker;
