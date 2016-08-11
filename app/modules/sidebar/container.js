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
    const { currentCompany, isAuthorityReady } = this.props;

    // data in context reflects the company that the user
    // is currently browsing,
    // if context.params is unavailable,
    // it will fall back to that in store which is the user company
    const contextSource = this.context.params || this.props;
    const { identity: carrierId } = contextSource;

    return (
      <Sidebar
        carrierId={carrierId}
        currentCompany={currentCompany}
        logo={logo}
        isAuthorityReady={isAuthorityReady}
        isOffCanvas={isOffCanvas}
        handleOffCanvas={handleOffCanvas}
      />
    );
  }
}

SidebarContainer.contextTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
  router: PropTypes.object,
};

SidebarContainer.propTypes = {
  currentCompany: PropTypes.object.isRequired,
  isAuthorityReady: PropTypes.bool.isRequired,
  isOffCanvas: PropTypes.bool.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
};

SidebarContainer = connectToStores(
  SidebarContainer,
  [AuthStore, AuthorityStore, ApplicationStore],
  context => ({
    identity: context.getStore(AuthStore).getCarrierId(),
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
    // eslint-disable-next-line max-len
    isAuthorityReady: !context.getStore(AuthorityStore).getIsLoading() && !!context.getStore(AuthorityStore).getIsLoaded(),
  })
);

export default SidebarContainer;
