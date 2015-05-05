import React from 'react';
import classnames from 'classnames';

import {NavLink} from 'fluxible-router';

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      sections: [
        {
          name: 'overview',
          icon: 'fi-web',
          link: '/admin'
        },
        {
          name: 'account',
          icon: 'fi-key',
          link: '/admin'
        },
        {
          name: 'company',
          icon: 'fi-home',
          link: '/admin/companies'
        },
        {
          name: 'setting',
          icon: 'fi-widget',
          link: '/admin'
        }]
    }
  },
  render: function() {
    return (
      <div
        className={classnames('mainmenu-bar','vertical', {offcanvas: this.props.isOffCanvas})}
        onMouseLeave={this.props.handleOffCavnas.bind(null, true)}
        onMouseEnter={this.props.handleOffCavnas.bind(null, false)}
      >
        <ul>
          {this.state.sections.map((section, idx)=>{
            return (
              <li>
                <NavLink className="item mainmenu-bar__item" href={section.link} key={idx}>
                  <label>
                    <i className={section.icon} />
                    {section.name}
                  </label>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    )
  }
});

export default Sidebar;
