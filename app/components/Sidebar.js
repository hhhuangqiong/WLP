import React from 'react';
import classnames from 'classnames';

import {NavLink} from 'fluxible-router';

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      sections: [
        {
          name: 'overview',
          icon: 'icon-menu-overview',
          link: '/admin'
        },
        {
          name: 'account',
          icon: 'icon-menu-account',
          link: '/admin'
        },
        {
          name: 'company',
          icon: 'icon-menu-company',
          link: '/admin/companies'
        },
        {
          name: 'setting',
          icon: 'icon-menu-setting',
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
          <li>
            <a className="item mainmenu-bar__item" href="#">
              <label>
              <i><img src="/images/logo-m800.png"/></i>
              <span>company name</span>
              </label>
            </a>
          </li>
          {this.state.sections.map((section,idx)=>{
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
