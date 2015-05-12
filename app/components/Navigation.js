import React from 'react';
import {NavLink} from 'fluxible-router';
import Modal from './Modal';
import Warning from './Warning';

import CompanySwitcher from './CompanySwitcher';

var Navigation = React.createClass({
  getInitialState:function(){
    return{modal:"close"}
  },
  modalControl:function(){
    this.setState({modal:(this.state.modal =="close")?"open":"close"})
    $("#myModal").foundation('reveal', this.state.modal);
  },
  onFormSubmit: function(data, callback) {
    console.log(data); // for form submit action
    this.modalControl();
  },
  render: function() {
    return (
      <section className="top-bar-section navigation-bar">
        <ul className="right">
          <li className="navigation-bar__item">
            <NavLink routeName="about">report issue</NavLink>
          </li>
          <li className="navigation-bar__item">
            <NavLink routeName="about">
              <i className="icon-question"/>
            </NavLink>
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <NavLink routeName="about">
              <i className="icon-companymenu"/>
            </NavLink>
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
                <a href="/logout"><i className="icon-logout"></i>logout</a>
              </li>
            </ul>
          </li>
        </ul>
          <Warning type="changePass" modalControl={this.modalControl} modalTitle="CHANGE PASSWORD" formSubmit={this.onFormSubmit}/>
      </section>
    );
  }
});


export default Navigation;
