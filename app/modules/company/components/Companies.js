import React, { PropTypes } from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import fetchCompanies from '../actions/fetchCompanies';
import CompanyList from './CompanyList';
import CompanyStore from '../stores/CompanyStore';
import Icon from '../../../main/components/Icon';

const Companies = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [CompanyStore],
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  componentDidMount() {
    const { executeAction, params } = this.context;

    executeAction(fetchCompanies,
      { carrierId: params.identity, searchCompany: '' }
    );
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    return {
      companies: this.getStore(CompanyStore).getCompanies(),
    };
  },
  _handleSearchChange(e) {
    if (e.keyCode === 13) {
      const { executeAction, params } = this.context;
      executeAction(
      fetchCompanies,
      { carrierId: params.identity, searchCompany: e.target.value.trim() }
    );
    }
  },

  render() {
    return (
      <div className="company" data-equalizer>
        <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
          <div>
          <input
            className="round"
            type="text"
            placeholder="search company"
            onKeyDown={this._handleSearchChange}
          />
          <Icon symbol="icon-search" />
        </div>
        </nav>
        <CompanyList companies={this.state.companies} />
      </div>
    );
  },
});

export default Companies;
