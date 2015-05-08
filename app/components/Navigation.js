import React from 'react';
import {NavLink} from 'fluxible-router';

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
            <ul className="dropdown dropdown--company-switcher">
              <li className="navigation-bar__item">
                <a href="/logout"><img src="/images/logo-yato.png"/></a>
              </li>
              <li className="navigation-bar__item">
                <a href="/logout"><img src="/images/logo-yato.png"/></a>
              </li>
              <li className="navigation-bar__item">
                <a href="/logout"><img src="/images/logo-yato.png"/></a>
              </li>
              <li className="navigation-bar__item">
                <a href="/logout"><img src="/images/logo-yato.png"/></a>
              </li>
            </ul>
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <a>hi, username
              <i className="icon-more"/>
            </a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                <a href="/logout">change password</a>
              </li>
              <li className="divider"></li>
              <li className="navigation-bar__item">
                <a href="/logout">logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  }
});


export default Navigation;
