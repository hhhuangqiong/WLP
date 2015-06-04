import _ from 'lodash';
import React   from 'react';
import {Link}  from 'react-router';

import ChangePass from './ChangePass';
import CompanySwitcher from './CompanySwitcher';

import showModal from '../actions/showModal';
import signOut from '../actions/signOut';

const companyPages = ['companies', 'company-create', 'company-profile', 'company-widget', 'company-service'];
const accountPages = ['accounts', 'account-create'];

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

  renderCreateButton: function() {
    let currentRoute = _.last(this.context.router.getCurrentRoutes());
    let { role, identity } = this.context.router.getCurrentParams();

    if (_.includes(companyPages, currentRoute.name)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to="company-create" params={{ role: role, identity: identity }}>
            create new company
          </Link>
        </li>
      )
    } else if (_.includes(accountPages, currentRoute.name)) {
      return (
        <li className="navigation-bar__item no-border">
          <Link to="account-create" params={{ role: role, identity: identity }}>
            create new account
          </Link>
        </li>
      )
    };

    return null;
  },

  render: function() {
    let { role, identity } = this.context.router.getCurrentParams();

    return (
      <section className="top-bar-section navigation-bar">
        <ul className="right">
          {this.renderCreateButton()}
          <li className="navigation-bar__item">
            <a href="http://support.maaii.com" target="_new">report issue</a>
          </li>
          <li className="navigation-bar__item">
            <Link to="TODO">
              <i className="icon-question"/>
            </Link>
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <Link to="TODO">
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
  executeAction: React.PropTypes.func.isRequired,
  router: React.PropTypes.func.isRequired
};

export default Navigation;
