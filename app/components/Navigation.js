import React from 'react';
import {NavLink} from 'fluxible-router';

import CompanySwitcher from './CompanySwitcher';

var Navigation = React.createClass({
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
                <a href="/logout"><i className="icon-change-password"></i>change password</a>
              </li>
              <li className="divider"></li>
              <li className="navigation-bar__item">
                <a href="/logout"><i className="icon-logout"></i>logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  }
});


export default Navigation;
