import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { connectToStores } from 'fluxible/addons';

import Permit from './Permit';
import ApplicationStore from '../../stores/ApplicationStore';
import AuthStore from '../../stores/AuthStore';

import navSections from '../../constants/navSection';

class Sidebar extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const navParams = this.context.router.getCurrentParams();
    const role = navParams.role || this.props.role;
    const identity = navParams.identity || this.props.carrierId;

    const companyName = this.props.currentCompany && this.props.currentCompany.name;
    let logoSrc = '/images/logo-m800.png';
    if (this.props.currentCompany && this.props.currentCompany.name !== 'M800') {
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
          {navSections.map((section, idx)=>{
            return (
              <Permit action="view" resource={section.page}>
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
              </Permit>
            );
          })}
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  role: PropTypes.string.isRequired,
  carrierId: PropTypes.string.isRequired,
  currentCompany: PropTypes.object.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  handleOffCavnas: PropTypes.func.isRequired,
};

Sidebar.contextTypes = {
  router: PropTypes.func.isRequired,
  getStore: PropTypes.func,
  executeAction: PropTypes.func,
};

// TODO: we can get navSections in NavStore
// with fetchData method to acquire accessible sections from server
Sidebar = connectToStores(Sidebar, [AuthStore, ApplicationStore], stores => {
  return {
    role: stores.AuthStore.getUserRole(),
    carrierId: stores.AuthStore.getCarrierId(),
    currentCompany: stores.ApplicationStore.getCurrentCompany(),
  };
});

export default Sidebar;