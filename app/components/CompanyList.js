import _ from 'lodash';
import React from 'react';
import {NavLink} from 'fluxible-router';

var Countries = require('../data/countries.json');

var CompanyList = React.createClass({
  getInitialState: function () {
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
  getFilteredCompanies: function() {
    if (this.state.searchCompany.length >= 2) {
      return _.filter(this.props.companies, (company)=>{
        return _.contains(company.name.toLowerCase(), this.state.searchCompany.toLowerCase());
      });
    }

    return this.props.companies || [];
  },
  render: function() {
    return (
      <div className="company-sidebar">
        <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
          <input
            type="text" placeholder="search company"
            onChange={this._handleSearchChange}
            />
            <i className="icon-search"/>
        </nav>
        <ul className="company-sidebar__list">
          {this.getFilteredCompanies().map(this.renderCompanyListItem)}
        </ul>
      </div>
    );
  },
  renderCompanyListItem: function(company) {

    let href = `/admin/companies/${company.carrierId}/settings/profile`;

    return (
      <NavLink href={href}>
        <li className="company-sidebar__list__list-item">
          <div className="company-sidebar__list__list-item__logo left">
            logo
          </div>
          <div className="company-sidebar__list__list-item__info left">
            <div className="company-sidebar__list__list-item__info__title">
              {company.name}
            </div>
            <div className="company-sidebar__list__list-item__info__location">
              {_.pluck(_.filter(Countries, {'alpha2': company.country}), 'name')}
            </div>
          </div>
        </li>
      </NavLink>
    )
  }
});

export default CompanyList;
