import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import { connectToStores } from 'fluxible-addons-react';

import Permit from './Permit';
import ApplicationStore from '../../stores/ApplicationStore';
import AuthStore from '../../stores/AuthStore';

import navSections from '../../constants/navSection';

class Sidebar extends Component {
  render() {
    const navParams = this.context.params;

    const role = navParams.role || this.props.role;
    const identity = navParams.identity || this.props.carrierId;

    const companyName = this.props.currentCompany && this.props.currentCompany.name;
    let logoSrc = '/images/logo-m800.png';
    if (this.props.currentCompany && this.props.currentCompany.name !== 'M800') {
      logoSrc = `/data/${this.props.currentCompany && this.props.currentCompany.logo}`;
    }

    const { pathname } = this.context.location;

    // assumes all paths' structure would be `/:role/:identity/[path]/[sub-page]`
    const path = pathname.split('/')[3];

    return (
      <div
        className={classnames('mainmenu-bar', 'vertical', { offcanvas: this.props.isOffCanvas })}
        onMouseLeave={this.props.handleOffCavnas.bind(null, true)}
        onMouseEnter={this.props.handleOffCavnas.bind(null, false)}
      >
        <ul>
          <li>
            <a className="item mainmenu-bar__item" href="#">
              <label>
                <i><img src={logoSrc} /></i>
                <span id="company-name">{companyName}</span>
              </label>
            </a>
          </li>
          {
            navSections.map((section, idx) => (
                <li key={idx}>
                  <Link
                    className={classnames(
                      'item',
                      'mainmenu-bar__item',
                      { active: (path === section.path) }
                    )}
                    to={`/${role}/${identity}/${section.path}`}
                  >
                    <label>
                      <i className={section.icon} />
                      {section.name}
                    </label>
                  </Link>
                </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  role: PropTypes.string,
  carrierId: PropTypes.string,
  currentCompany: PropTypes.object,
  isOffCanvas: PropTypes.bool.isRequired,
  handleOffCavnas: PropTypes.func.isRequired,
};

Sidebar.contextTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  router: PropTypes.object,
};

// TODO: we can get navSections in NavStore
// with fetchData method to acquire accessible sections from server
Sidebar = connectToStores(Sidebar, [AuthStore, ApplicationStore], stores => ({
  role: stores.getStore(AuthStore).getUserRole(),
  carrierId: stores.getStore(AuthStore).getCarrierId(),
  currentCompany: stores.getStore(ApplicationStore).getCurrentCompany(),
}));

export default Sidebar;
