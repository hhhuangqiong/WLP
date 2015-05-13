import React from 'react';
import classnames from 'classnames';

import {NavLink} from 'fluxible-router';

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      sections: [
        {
          name: 'overview',
          icon: 'icon-menuoverview',
          link: '/admin'
        },
        {
          name: 'account',
          icon: 'icon-menuaccount',
          link: '/admin'
        },
        {
          name: 'company',
          icon: 'icon-menucompany',
          link: '/admin/companies'
        },
        {
          name: 'setting',
          icon: 'icon-menusetting',
          link: '/admin'
        },
        {
          name: 'End users',
          icon: 'icon-menuenduser',
          link: '/w/maaiitest.com/end-users'
        },
        {
          name: 'Top up',
          icon: 'icon-menutopup',
          link: '/w/maaiitest.com/top-up'
        },
        {
          name: 'Calls',
          icon: 'icon-menucalls',
          link: '/w/maaiitest.com/calls'
        },
        {
          name: 'IM',
          icon: 'icon-menuim',
          link: '/w/maaiitest.com/im'
        },
        {
          name: 'Store',
          icon: 'icon-menustore',
          link: '/w/maaiitest.com/vsf'
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
