'use strict';
import React from 'react';
import ModalStore from '../stores/ModalStore';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

var modal = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [ModalStore]
  },
  /**
   * get states of Company List and Current Company from CompanyStore
   *
   * @returns {Object}
   */
  getInitialState: function () {
    return this.getStore(ModalStore).getState();
  },
  /**
   * capture Company Store changes and take effect
   */
  handleChange:function(){
    //rendering modal content
    var contentDiv = $('<div>');
    $("#myModal").empty(); // clear element each updated;
    var reveal = $("#myModal").append("<p class='text-center'>"+this.state.Title+"</p><hr/>").append($(contentDiv)).addClass("tiny");
    $(reveal).foundation('reveal', 'close');
    $(reveal).bind('closed.fndtn.reveal', function(e){ React.unmountComponentAtNode(this); });

    if(React.isValidElement(this.state.Content)) {
      React.render(this.state.Content, $(contentDiv)[0]);
    }
    else {
      $(contentDiv).append(this.state.Content);
    }
    var condition = (!this.state.isModalOpen) ? "open" : "close";
    this.setState({isModalOpen: !this.state.isModalOpen})
    $("#myModal").foundation('reveal', condition);
  },
  onChange: function() {
    let state = this.getStore(ModalStore).getState();
    this.setState(state);
    this.handleChange();
  },
  render: function(){
    return (
      <div id="myModal" className="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
      </div>
    );
  },
  componentDidMount: function () {
    var elm = this;
    $(document).on('closed.fndtn.reveal', '[data-reveal]', function () {
      elm.setState({isModalOpen: false});
    });
  }
});
export default modal;
