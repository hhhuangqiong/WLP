import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';

import { getCountryName } from '../../../utils/StringFormatter';

let CompanyList = React.createClass({
  PropTypes: {
    companies: PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {
      companies: {}
    };
  },

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
	  // equalise the height of the list and main area
	  $(document).foundation({
      equalizer: {
        equalize_on_stack: true
      }
    });
  },

  getInitialState: function() {
    return {
      searchCompany: ''
    };
  },

  _handleSearchChange: function(e) {
    this.setState({
      searchCompany: e.target.value.trim()
    });
  },

  /**
   * Filter property of companies with keyword starting from 3 or more characters
   * supports only company name matching
   *
   * @returns {Object} returns companies Object or empty Array
   */
  _getFilteredCompanies: function(companies) {
    if (this.state.searchCompany.length >= 2) {
      return _.filter(companies, (company) => {
        return _.contains(company.name.toLowerCase(), this.state.searchCompany.toLowerCase());
      });
    }

    return _.values(companies) || [];
  },

  render: function() {
    return (
      <div className="company-sidebar">
        <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
          <input className="round"
            type="text" placeholder="search company"
            onChange={this._handleSearchChange}
          />
          <i className="icon-search"/>
        </nav>
        <ul className="company-sidebar__list">
          {this._getFilteredCompanies(this.props.companies).map(this.renderCompanyListItem)}
        </ul>
      </div>
    );
  },

  renderCompanyListItem: function(company, key) {
    let { role, identity } = this.context.router.getCurrentParams();

    // TODO add default logo
    // TODO reference status string from Company Collection ?
    return (
      <li className="company-sidebar__list__item" key={key}>
        <Link to="company-profile" params={{ role, identity, carrierId: company.carrierId }}>
          <span className="company-sidebar__list__item__logo left">
            <If condition={company.logo}>
              <img src={`/data/${company.logo}`} />
            <Else />
              <span></span>
            </If>
          </span>
          <span className="company-sidebar__list__item__info left">
            <span className="company-sidebar__list__item__info__title">
              {company.name}
            </span>
            <span className="company-sidebar__list__item__info__location">
              {getCountryName(company.country)}
            </span>
          </span>
          <span className="company-sidebar__list__item__status left">
            <span className={classNames('status', 'label', 'radius', { success: company.status === 'active' }, { alert: company.status === 'inactive' })} />
          </span>
        </Link>
      </li>
    )
  }
});

export default CompanyList;
