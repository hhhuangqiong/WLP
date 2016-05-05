import { get } from 'lodash';
import React, { PropTypes, Component } from 'react';
import Sidebar from './component';
import AuthStore from '../../main/stores/AuthStore';
import AuthorityStore from '../../modules/authority/store';
import ApplicationStore from '../../main/stores/ApplicationStore';
import { connectToStores } from 'fluxible-addons-react';

class SidebarContainer extends Component {
  constructor(props) {
    super(props);

    this._getLogo = this._getLogo.bind(this);
  }

  _getLogo() {
    const defaultLogo = '/images/logo-m800.png';
    const logo = get(this.props, 'currentCompany.logo');
    return !!logo ? `/data/${logo}` : defaultLogo;
  }

  render() {
    const logo = this._getLogo();
    const { isOffCanvas, handleOffCanvas } = this.props;
    const { carrierId, currentCompany, isAuthorityReady, role } = this.props;

    return (
      <Sidebar
        carrierId={carrierId}
        currentCompany={currentCompany}
        logo={logo}
        role={role}
        isAuthorityReady={isAuthorityReady}
        isOffCanvas={isOffCanvas}
        handleOffCanvas={handleOffCanvas}
      />
    );
  }
}

Sidebar.contextTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  router: PropTypes.object,
};

SidebarContainer.propTypes = {
  carrierId: PropTypes.string.isRequired,
  currentCompany: PropTypes.object.isRequired,
  isAuthorityReady: PropTypes.bool.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired,
};

SidebarContainer = connectToStores(
  SidebarContainer,
  [AuthStore, AuthorityStore, ApplicationStore],
  context => ({
    role: context.getStore(AuthStore).getUserRole(),
    carrierId: context.getStore(AuthStore).getCarrierId(),
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
    // eslint-disable-next-line max-len
    isAuthorityReady: !context.getStore(AuthorityStore).getIsLoading() && !!context.getStore(AuthorityStore).getIsLoaded(),
  })
);

export default SidebarContainer;
