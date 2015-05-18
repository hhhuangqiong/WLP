'use strict';

import React from 'react';
import ValidationMixin from 'react-validation-mixin';
import Joi from 'joi';
import Message from './ValidateErrorMsg';

var ForgetPassword = React.createClass({
  displayName: 'ForgetPassword',
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
          // TODO should not be hardcoded
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
        <div className="panel--extra__title row padding-bottom-reset">
            <div className="large-24 columns">
              <h1 className="text-center">Reset Password</h1>
            </div>
          </div>
          <div className="panel--extra__body row">
            <div className="large-offset-1 large-22 columns">
              <div className="row">
                <div className="large-24 columns">
                  <p className="text-center">Reset your password by entering your<br/>resisted email</p>
                </div>
              </div>
              <div className="row">
                <div className="large-24 columns text-center">
                  <input className="radius" type="email" placeholder="Email address" id='email' valueLink={this.linkState('email')}
                         onBlur={this.handleValidation('email')}/>
                  {this.renderHelpText(this.getValidationMessages('email'))}
                </div>
              </div>
              <div className="row">
                <div className="large-24 columns text-center">
                  <a className="button--secondary" href="/signin">Cancel</a>
                  <input type="submit" value="Submit" className="button--primary"/>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
});
export default ForgetPassword;
