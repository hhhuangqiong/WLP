import _ from 'lodash';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

import { getCountryName } from '../../../utils/StringFormatter';

const CompanyList = React.createClass({
  propTypes: {
    companies: PropTypes.object.isRequired,
  },

  contextTypes: {
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      companies: {},
    };
  },

  getInitialState() {
    return {
      searchCompany: '',
    };
  },

  componentDidMount() {
    // equalise the height of the list and main area
    $(document).foundation({
      equalizer: {
        equalize_on_stack: true,
      },
    });
  },

  _handleSearchChange(e) {
    this.setState({
      searchCompany: e
        .target
        .value
        .trim(),
    });
  },

  /**
   * Filter property of companies with keyword starting from 3 or more characters
   * supports only company name matching
   *
   * @returns {Object} returns companies Object or empty Array
   */
  _getFilteredCompanies(companies) {
    if (this.state.searchCompany.length >= 2) {
      return _.filter(companies, company => (
        _.contains(company.name.toLowerCase(), this
          .state
          .searchCompany
          .toLowerCase()
        )
      ));
    }

    return _.values(companies) || [];
  },

  renderCompanyListItem(company, key) {
    const { role, identity } = this
      .context
      .params;

    // TODO add default logo
    // TODO reference status string from Company Collection ?
    return (
      <li className="company-sidebar__list__item" key={key}>
        <Link to={`/${role}/${identity}/companies/${company.carrierId}/profile`}>
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
            <span className={classNames(
              'status',
              'label',
              'radius',
              { success: company.status === 'active' },
              { alert: company.status === 'inactive' })}
            />
          </span>
        </Link>
      </li>
    );
  },

  render() {
    return (
      <div className="company-sidebar">
        <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
          <input className="round"
            type="text" placeholder="search company"
            onChange={this._handleSearchChange}
          />
          <i className="icon-search" />
        </nav>
        <ul className="company-sidebar__list">
          {this._getFilteredCompanies(this.props.companies).map(this.renderCompanyListItem)}
        </ul>
      </div>
    );
  },
});

export default CompanyList;
