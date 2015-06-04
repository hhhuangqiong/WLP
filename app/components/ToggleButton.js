import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import {fetchIm} from '../actions/fetchIm';

var ToggleButton = React.createClass({
  mixins: [FluxibleMixin],
  getInitialState: function() {
    return {  type:'No Data!',
              class:'',
              status:true,
              cb: function (e) {

              },
    };
  },

  componentWillReceiveProps: function(nextProps){
    console.log(nextProps);
    this.setState(nextProps);
  },
  handleClick: function() {
    this.setState({status: !this.state.status});
    this.executeAction(this.state.cb, {[this.state.type]:this.state.status}, ()=>{});
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
