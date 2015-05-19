import React from 'react';
import classnames from 'classnames';
import {Link} from 'react-router';
import {connectToStores} from 'fluxible/addons';

import AuthStore from '../stores/AuthStore';

let navSections = [
  {
    name: 'overview',
    icon: 'icon-menuoverview',
    routeName: 'overview'
  },
  {
    name: 'account',
    icon: 'icon-menuaccount',
    routeName: 'accounts'
  },
  {
    name: 'company',
    icon: 'icon-menucompany',
    routeName: 'companies'
  },
  {
    name: 'setting',
    icon: 'icon-menusetting',
    routeName: 'settings'
  },
  {
    name: 'End users',
    icon: 'icon-menuenduser',
    routeName: 'end-users'
  },
  {
    name: 'Top up',
    icon: 'icon-menutopup',
    routeName: 'top-up'
  },
  {
    name: 'Calls',
    icon: 'icon-menucalls',
    routeName: 'calls'
  },
  {
    name: 'IM',
    icon: 'icon-menuim',
    routeName: 'im'
  },
  {
    name: 'Store',
    icon: 'icon-menustore',
    routeName: 'vsf'
  }
];

class Sidebar extends React.Component{
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let navParams = this.context.router.getCurrentParams();
    let role = navParams.role || this.props.role;
    let identity = navParams.identity || this.props.carrierId;

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
            return (
              <li key={idx}>
                <Link
                  className="item mainmenu-bar__item"
                  to={section.routeName}
                  params={{ role: role, identity: identity }}
                >
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
  router: React.PropTypes.func.isRequired,
  getStore: React.PropTypes.func,
  executeAction: React.PropTypes.func
};

// TODO: we can get navSections in NavStore
// with fetchData method to acquire accessible sections from server
Sidebar = connectToStores(Sidebar, [AuthStore], function (stores, props) {
  return {
    role: stores.AuthStore.getUserRole(),
    carrierId: stores.AuthStore.getCarrierId()
  };
});

export default Sidebar;
