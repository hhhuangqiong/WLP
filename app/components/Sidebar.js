import React from 'react';
import classnames from 'classnames';
import {Link} from 'react-router';
import {connectToStores} from 'fluxible/addons';

import ApplicationStore from '../stores/ApplicationStore';
import AuthStore from '../stores/AuthStore';

let navSections = [
  {
    name: 'Overview',
    icon: 'icon-menuoverview',
    routeName: 'overview'
  },
  /** [WLP-297] temporary hide end user section for bolt 1.1 */
  // {
  //   name: 'Users',
  //   icon: 'icon-menuenduser',
  //   routeName: 'end-users'
  // },
  {
    name: 'company',
    icon: 'icon-menucompany',
    routeName: 'companies'
  },
  {
    name: 'Calls',
    icon: 'icon-menucalls',
    routeName: 'calls-overview'
  },
  {
    name: 'IM',
    icon: 'icon-menuim',
    routeName: 'im-overview'
  },
  {
    name: 'SMS',
    icon: 'icon-menu-sms',
    'routeName': 'sms-overview'
  },
  {
    name: 'VSF',
    icon: 'icon-menustore',
    routeName: 'vsf-transaction-overview'
  },
  {
    name: 'Top Up',
    icon: 'icon-menutopup',
    routeName: 'top-up-details'
  },
  {
    name: 'Verification',
    icon: 'icon-menuenduser',
    routeName: 'verification'
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

    let companyName = this.props.currentCompany && this.props.currentCompany.name;
    let logoSrc = '/images/logo-m800.png';
    if (this.props.currentCompany && this.props.currentCompany.name != 'M800') {
      logoSrc = `/data/${this.props.currentCompany && this.props.currentCompany.logo}`;
    }

    return (
      <div
        className={classnames('mainmenu-bar', 'vertical', {offcanvas: this.props.isOffCanvas})}
        onMouseLeave={this.props.handleOffCavnas.bind(null, true)}
        onMouseEnter={this.props.handleOffCavnas.bind(null, false)}
      >
        <ul>
          <li>
            <a className="item mainmenu-bar__item" href="#">
              <label>
                <i><img src={logoSrc} /></i>
                <span>{companyName}</span>
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
Sidebar = connectToStores(Sidebar, [AuthStore, ApplicationStore], function (stores, props) {
  return {
    role: stores.AuthStore.getUserRole(),
    carrierId: stores.AuthStore.getCarrierId(),
    currentCompany: stores.ApplicationStore.getCurrentCompany()
  };
});

export default Sidebar;
