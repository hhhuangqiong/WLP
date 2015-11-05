
'use strict';
import React from 'react';
var Message = React.createClass({
  render:function(){
    return(
      <div className="error-message-box">
        <span className="error">
          {this.props.message}
        </span>
      </div>
    )
  }
})
export default Message;
