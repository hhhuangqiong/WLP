import { get } from 'lodash';
import React, { PropTypes, Component } from 'react';
import Sidebar from './component';
import AuthStore from '../../main/stores/AuthStore';
import ApplicationStore from '../../main/stores/ApplicationStore';
import { connectToStores } from 'fluxible-addons-react';

class SidebarContainer extends Component {
  constructor(props) {
    super(props);

    this._getLogo = this._getLogo.bind(this);
  }

  _getLogo() {
    return get(this.props, 'currentCompany.logo');
  }

  render() {
    const logo = this._getLogo();
    const { isOffCanvas, handleOffCanvas } = this.props;
    const { currentCompany } = this.props;

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
  isOffCanvas: PropTypes.bool.isRequired,
  handleOffCanvas: PropTypes.func.isRequired,
};

SidebarContainer = connectToStores(
  SidebarContainer,
  [AuthStore, ApplicationStore],
  context => ({
    identity: context.getStore(AuthStore).getCarrierId(),
    currentCompany: context.getStore(ApplicationStore).getCurrentCompany(),
  })
);

export default SidebarContainer;
