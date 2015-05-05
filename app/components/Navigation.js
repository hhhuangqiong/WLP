import React from 'react';
import {NavLink} from 'fluxible-router';

var Navigation = React.createClass({
  render: function() {
    return (
      <section className="top-bar-section navigation-bar">
        <ul className="right">
          <li className="navigation-bar__item">
            <NavLink routeName="about" className="navigation-bar__item__name">report issue</NavLink>
          </li>
          <li className="navigation-bar__item">
            <NavLink routeName="about" className="navigation-bar__item__name">
              <i className="fi-info"/>
            </NavLink>
          </li>
          <li className="navigation-bar__item">
            <NavLink routeName="about" className="navigation-bar__item__name">
              <i className="fi-thumbnails"/>
            </NavLink>
          </li>
          <li className="has-dropdown not-click navigation-bar__item">
            <a>hi, username</a>
            <ul className="dropdown">
              <li className="navigation-bar__item">
                <a href="/logout" className="navigation-bar__item__name">logout</a>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    );
  }
});


export default Navigation;
