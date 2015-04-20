'use strict';
import React from 'react';

var divStyle = {
  "color":"#000",
  "font-size": "inherit",
  "font-weight": "inherit",
  "line-height": "inherit",
  "position": "unset",
  "right": 0,
  "top": 0,
  "background-color":""
};

var modal = React.createClass({
  displayName: 'pop up',
  render:function(){
    return (
      <div id="myModal" className="reveal-modal medium" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
        <p id="modalTitle">{this.props.modalTitle}</p>
        <hr/>
        {
          this.props.modalContent.map(function(content){
            return(
              <p className={content.class}>{content.content}</p>
            )
          })
        }
        <hr/>
        <p className="text-center">
          <a className="round button small close-reveal-modal" style={divStyle}>Close</a>
        </p>
      </div>
    )
  }

});
export default modal;
