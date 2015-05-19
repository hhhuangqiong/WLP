import React   from 'react';
import {Link}  from 'react-router';

import ChangePass from './ChangePass';
import CompanySwitcher from './CompanySwitcher';

import showModal from '../actions/showModal';
import signOut from '../actions/signOut';

var Navigation = React.createClass({
  getInitialState: function(){
    return {
      modal: "close"
    }
  },

  modalControl: function () {
    this.context.executeAction(showModal, {title: "Change Password", content: <ChangePass />})},
  onFormSubmit: function(data, callback) {
    console.log(data); // for form submit action
    this.modalControl();
  },

  handleSignOut: function(e) {
    e.preventDefault();
    this.context.executeAction(signOut, {});
  },

  render: function() {
    return (
      <section className="top-bar-section navigation-bar">
        <ul className="right">
          <li className="navigation-bar__item">
            <Link to="about">report issue</Link>
          </li>
          <li className="navigation-bar__item">
            <Link to="about">
              <i className="icon-question"/>
            </Link>
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <Link to="about">
              <i className="icon-companymenu"/>
            </Link>
            <CompanySwitcher />
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <a>hi, username
              <i className="icon-more"/>
            </a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                <a onClick={this.modalControl}><i className="icon-change-password"></i><span>change password</span></a>
              </li>
              <li className="divider"></li>
              <li className="navigation-bar__item">
                <a href="" onClick={this.handleSignOut}>
                  <i className="icon-logout"></i>
                  logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  }
});

Navigation.contextTypes = {
  getStore: React.PropTypes.func.isRequired,
  executeAction: React.PropTypes.func.isRequired
};

export default Navigation;
