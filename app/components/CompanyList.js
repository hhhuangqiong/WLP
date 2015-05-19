import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

var Countries = require('../data/countries.json');

var CompanyList = React.createClass({
  componentDidMount: function() {
	// equalise the height of the list and main area
	$(document).foundation({
      equalizer : {
        equalize_on_stack: true
      }
    });
  },
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

    // $(document).foundation({
    //   equalizer : {
    //     equalize_on_stack: true
    //   }
    // });

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

    let logo = !!company.logo ? `/data/${company.logo}` : '/images/logo-yato.png';

    return (
      <li className="company-sidebar__list__item">
        <Link to="company" params={{ role: company.role, identity: company.identity, carrierId: company.carrierId, companyCarrierId: company.carrierId, subPage: 'profile' }}>
          <span className="company-sidebar__list__item__logo left">
            <img src={logo} />
          </span>
          <span className="company-sidebar__list__item__info left">
            <span className="company-sidebar__list__item__info__title">
              {company.name}
            </span>
            <span className="company-sidebar__list__item__info__location">
              {_.pluck(_.filter(Countries, {'alpha2': company.country}), 'name')}
            </span>
          </span>
          <span className="company-sidebar__list__item__status left">
            <span className="status--active"></span>
          </span>
        </Link>
      </li>
    )
  }
});

export default CompanyList;
