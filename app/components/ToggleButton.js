import React from 'react';

var ToggleButton = React.createClass({
  getInitialState: function() {
    return {  type:'No Data!',
              class:'',
              status:false,
    };
  },
  componentWillReceiveProps: function(nextProps){
    this.setState(nextProps);
  },
  handleClick: function(event) {
    this.setState({status: !this.state.status});
  },
  render: function() {
    var classes = "button "+this.state.class+" ";
    classes += (this.state.status) ? "active" : "";
    return (
      <li><a className={classes} onClick={this.handleClick}></a></li>
    );
  }
});

export default ToggleButton;
