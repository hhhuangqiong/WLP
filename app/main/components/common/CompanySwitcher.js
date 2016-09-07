import _ from 'lodash';
import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';

import { userPath } from '../../../utils/paths';
import ApplicationStore from '../../stores/ApplicationStore';

import Icon from '../Icon';

const DEFAULT_LOGO_SRC = '/images/logo-m800.png';

const CompanySwitcher = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore],
  },

  getInitialState() {
    return this.getStateFromStore();
  },

  onChange() {
    this.setState(this.getStateFromStore());
  },

  getStateFromStore() {
    return {
      companies: this.getStore(ApplicationStore).getManagingCompanies(),
    };
  },

  render() {
    const buttons = this
      .state
      .companies
      .map(({ name, carrierId, logo }) => {
        const logoSrc = !!logo ? logo : DEFAULT_LOGO_SRC;
        // it will redirect to carrierId path and refresh the page when switching company.
        // it will then load the company info and recontruct the defaultPath in the app route.
        const destination = `${userPath(carrierId)}/`;
        return (
          <li className="navigation-bar__item" title={name} key={carrierId}>
            <a href={destination}>
              <img src={logoSrc} alt={name} />
            </a>
          </li>
        );
      });

    return (
      <If condition={!_.isEmpty(this.state.companies)}>
        <li className="has-dropdown not-click navigation-bar__item">
          <a className="company-switcher">
            <Icon symbol="icon-companymenu" />
          </a>
          <ul className="dropdown dropdown--company-switcher">
            {buttons}
          </ul>
        </li>
      <Else />
        { null }
      </If>
    );
  },
});

export default CompanySwitcher;
