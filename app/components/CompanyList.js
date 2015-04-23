'use strict';
import _ from 'lodash';
import React from 'react';
import {NavLink} from 'flux-router-component';

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
  getFilteredCompanies: function() {
    // do filtering only when keyword is with 2 more characters
    if (this.state.searchCompany.length >= 2) {
      return _.filter(this.props.companies, (company)=>{
        return _.contains(company.name, this.state.searchCompany);
      });
    }

    return this.props.companies;
  }
  ,
  render: function() {
    return (
      <div className="companies-list-bar">
        <div className="companies-list-bar__search-bar large-24 columns">
          <input
            type="text" placeholder="search company"
            onChange={this._handleSearchChange}
          />
        </div>
        <ul className="companies-list-bar__list">
          {this.getFilteredCompanies().map(this.renderCompanyListItem)}
        </ul>
      </div>
    );
  },
  renderCompanyListItem: function(company) {

    let href = `/admin/companies/${company.carrierId}`;
    
    return (
      <NavLink href={href}>
        <li className="companies-list-bar__list__list-item">
          <div className="companies-list-bar__list__list-item__logo left">
            logo
          </div>
          <div className="companies-list-bar__list__list-item__info left">
            <div className="companies-list-bar__list__list-item__info__title">
              {company.name}
            </div>
            <div className="companies-list-bar__list__list-item__info__location">
              {company.location}
            </div>
          </div>
        </li>
      </NavLink>
    )
  }
});

export default CompanyList;
