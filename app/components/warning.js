'use strict';
import React from 'react';
import Modal from './Modal.js';
import ChangePass from './ChangePass.js';

var CommentBox = React.createClass({
  getDefaultProps:function(){
    return {
      type:"itemConfirm",
      deleteItem:this.passFn,
      items:100,
      upload_item:[{itemName:"apple"},{itemName:"orange"},{itemName:"mango"}]
    }
  },
  passFn:function(){
    console.log("pass delete fn !")
  },
  render: function() {
    if (this.props.type == "accoutLocked") {
      return (
        <Modal {...this.props}>
          <div className="row">
           <p> Please contact account management team to unlock the account</p>
            <p>support@M800.com</p>
            <p>3069 9595</p>
            <hr/>
            <p className="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Close</div>
            </p>
            </div>
          </Modal>
      )
    }if (this.props.type == "deleteConfirm") {
      return (
        <Modal {...this.props}>
          <div className="row">
           <p> Are you sure you want to delete the item ?</p>>
            <hr/>
            <p className="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Close</div>
              <div className="button radius" onClick={this.props.deleteItem}>Delete</div>
            </p>
            </div>
          </Modal>
      )
    }else if(this.props.type == "itemConfirm") {
      return (
        <Modal {...this.props}>
          <div className="row">
            All records are uploaded.
            <hr/>
            <p className="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Cancel</div>
            </p>
          </div>
        </Modal>
      )
    }else if(this.props.type == "uploadSuccess") {
      var items = this.props.upload_item.map(function(item){
          return(
            <li>{item.itemName}</li>
          )
      })
      return (
        <Modal {...this.props}>
          <div className="row">
            UPLOAD SUCCESS
            <p>{this.props.upload_item.length} records cannot be updated</p>
            <ul>
              {items}
            </ul>
            <p className="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Cancel</div>
            </p>
          </div>
        </Modal>
      )
    }else if(this.props.type == "uploadError"){
      return (
        <Modal {...this.props}>
          <div className="row">
            Wrong Format. Only support xxxx format
            <p clasName="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Cancel</div>
              <div className="button radius" onClick={this.props.modalControl}>Retry</div>
            </p>
          </div>
        </Modal>
      )
    }else if(this.props.type == "downloadError"){
      return (
        <Modal {...this.props}>
          <div className="row">
            <p>Sorry, Lorum ipsum dolor sit amet consectur</p>
            <hr/>
            <p clasName="text-center">
              <div className="button radius" onClick={this.props.modalControl}>Cancel</div>
            </p>
          </div>
        </Modal>
      )
    }else if(this.props.type == "changePass"){
      return (
        <Modal {...this.props}>
          <ChangePass modalControl={this.modalControl} onFormSubmit={this.props.formSubmit} />
        </Modal>
      )
    }
  }
});


export default CommentBox;
