'use strict';
import React from 'react';
import ValidationMixin from 'react-validation-mixin';
import Joi from 'joi';
import Message from './ValidateErrorMsg.js';
import formMixin from '../utils/formMixin';
var ChangePass = React.createClass({
  displayName: 'ChangePass',
  mixins: [ValidationMixin, React.addons.LinkedStateMixin,formMixin],
  validatorTypes:  {
    pass: Joi.string().regex(/[a-zA-Z0-9]{8,20}/),
    repass: Joi.any().valid(Joi.ref('pass')).required(),
    current: Joi.string().required()
  },
  getInitialState: function() {
    return {pass:"",repass:"",current:""};
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var onValidate = function(error, validationErrors) {
      if (!error) {
        var pass = this.state.pass.trim();
        var repass = this.state.repass.trim();

        this.onSubmit({
          pass:pass,
          repass: repass,
          url: "/api/submit"
        });
      }
    }.bind(this);
    this.validate(onValidate);
  },
  renderHelpCurrentText: function(message) {
    if (!this.isValid("current")) {
      return (
        <Message message="Current Password is required"/>
      )
    }
  },
  renderHelpPassText: function(message) {
    var pass = this.state.pass;
    if (!this.isValid("pass")) {
      if (!pass) {
        return (
          <Message message="Password is required"/>
        )
      }else {
        return (
          <Message message=" Your password must be in between 8-20 characters !"></Message>
        )
      }
    }
  },
  renderHelpRePassText: function(message) {
    var pass = this.state.pass;
    if(this.isValid("pass") && pass){
      if(!this.isValid("repass")){
        return (
          <Message message="it shoud be the same witth password field"></Message>
        );
      }
    }

  },
  handleReset: function(event) {
    event.preventDefault();
    this.clearValidations();
    this.setState(this.getInitialState());
  },
  render: function() {
    var myStyle={
      "font-size": "inherit",
      "line-height": "inherit",
      "position": "inherit",
      "color": "#FFF",
      "font-weight": "inherit"

  }
    return (
      <form onSubmit={this.handleSubmit} noValidate>
        <div className='row'>
          <p>Please enter your current password</p>

          <div className="error-message-box tooltips">
            <input type="password" placeholder="Current Password" Ne id='current' valueLink={this.linkState('current')}
                   onBlur={this.handleValidation('current')}/>
            {this.renderHelpCurrentText(this.getValidationMessages('current'))}
          </div>
          <br/>

          <p>and your new password</p>

          <div className="error-message-box tooltips">
            <input type="password" placeholder="New Password" id='pass' valueLink={this.linkState('pass')}
                   onBlur={this.handleValidation('pass')}/>
            {this.renderHelpPassText(this.getValidationMessages('pass'))}
          </div>
          <div className="error-message-box tooltips">
            <input type="password" placeholder="Re-type password" id='repass' valueLink={this.linkState('repass')}
                   onBlur={this.handleValidation('repass')}/>
            {this.renderHelpRePassText(this.getValidationMessages('repass'))}
          </div>
          <hr/>
          <p className="text-center">
            <a className="button radius close-reveal-modal" style={myStyle} aria-label="Close">Cancel</a>
            <input type="submit" value="Change" className="button radius"/>
          </p>
        </div>
      </form>
    );
  }
});
export default ChangePass;
