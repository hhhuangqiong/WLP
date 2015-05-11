'use strict';
import React from 'react';
import ValidationMixin from 'react-validation-mixin';
import Joi from 'joi';
import Message from './ValidateErrorMsg';

var ForgetPass = React.createClass({
  displayName: 'ForgetPass',
  mixins: [ValidationMixin, React.addons.LinkedStateMixin],
  validatorTypes:  {
    email: Joi.string().regex(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i).label('Email Address')
  },
  getInitialState: function() {
    return {email:''};
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var onValidate = function(error, validationErrors) {
      if (!error) {
        var userEmail = this.state.email.trim();
        this.onFormSubmit({
          userEmail: userEmail,
          url: "/api/submit"
        });
      }
    }.bind(this);
    this.validate(onValidate);
  },
  renderHelpText: function(message) {
    var userEmail = this.state.email.trim();
    if(this.state.errors!=undefined){
      if(!this.isValid("email")){
        if (!userEmail) {
          return (
            <Message message="Email is required !"/>
          )
        } else {
          return (
            <Message message="Email is not valid !"/>
          );
        }
      }else{
        return
      }
    }
  },
  handleReset: function(event) {
    event.preventDefault();
    this.clearValidations();
    this.setState(this.getInitialState());
  },
  onFormSubmit: function(data, callback){
    console.log(data)
  },
  render: function() {
    return (
      <div className='row'>

        <form onSubmit={this.handleSubmit} noValidate>
          <h3>Reset Password</h3>
          <p>Reset your password by entering your resisted email</p>
          <input type="email" placeholder="Email address" id='email' valueLink={this.linkState('email')}
                 onBlur={this.handleValidation('email')}/>
          {this.renderHelpText(this.getValidationMessages('email'))}
          <p className="text-center">
            <a className="button radius" href="/signin">Cancel</a>
            <input type="submit" value="Submit" className="button radius"/>
          </p>
        </form>
      </div>
    );
  }
});
export default ForgetPass;
