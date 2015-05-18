import React from 'react';
import classnames from 'classnames';
import {Link} from 'react-router';
import {connectToStores} from 'fluxible/addons';

import AuthStore from '../stores/AuthStore';

let navSections = [
  {
    name: 'overview',
    icon: 'icon-menuoverview',
    link: '/overview'
  },
  {
    name: 'account',
    icon: 'icon-menuaccount',
    link: '/accounts'
  },
  {
    name: 'company',
    icon: 'icon-menucompany',
    link: '/companies'
  },
  {
    name: 'setting',
    icon: 'icon-menusetting',
    link: '/settings'
  },
  {
    name: 'End users',
    icon: 'icon-menuenduser',
    link: '/end-users'
  },
  {
    name: 'Top up',
    icon: 'icon-menutopup',
    link: '/top-up'
  },
  {
    name: 'Calls',
    icon: 'icon-menucalls',
    link: '/calls'
  },
  {
    name: 'IM',
    icon: 'icon-menuim',
    link: '/im'
  },
  {
    name: 'Store',
    icon: 'icon-menustore',
    link: '/vsf'
  }
];

class Sidebar extends React.Component{
  constructor(props, context) {
    super(props, context);
  }

  render() {
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
          {navSections.map((section,idx)=>{
            let href = `${this.props.urlPrefix}/${section.link}`;
            return (
              <li key={idx}>
                <Link className="item mainmenu-bar__item" to={href}>
                  <label>
                    <i className={section.icon} />
                    {section.name}
                  </label>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    )
  }
}

Sidebar.contextTypes = {
  getStore: React.PropTypes.func,
  executeAction: React.PropTypes.func
};

// TODO: we can get navSections in NavStore
// with fetchData method to acquire accessible sections from server
Sidebar = connectToStores(Sidebar, [AuthStore], function (stores, props) {
  return {
    carrierId: stores.AuthStore.getCarrierId(),
    urlPrefix: stores.AuthStore.getUserUrlPrefix()
  };
});

export default Sidebar;
