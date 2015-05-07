'use strict';
import React from 'react';

var modal = React.createClass({
  displayName: 'pop up',
  render: function(){
    return (
      <div id="myModal" className="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
      </div>
    );
  },
  componentDidMount: function(){
    var contentDiv = $('<div>');
    var reveal = $("#myModal").append("<p class='text-center'>"+this.props.modalTitle+"</p><hr/>").append($(contentDiv)).addClass("small");
    $(reveal).foundation().foundation('reveal', 'close');
    $(reveal).bind('closed.fndtn.reveal', function(e){ React.unmountComponentAtNode(this); });

    if(React.isValidElement(this.props.children)) {
      React.render(this.props.children, $(contentDiv)[0]);
    }
    else {
      $(contentDiv).append(this.props.children);
    }
  }
});
export default modal;
