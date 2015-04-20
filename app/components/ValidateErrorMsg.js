
'use strict';
import React from 'react';
var Message = React.createClass({
  render:function(){
    return(
      <div className="error-message-box">
        <label className="error">
          {this.props.message}
        </label>
      </div>
    )
  }
})
export default Message;
