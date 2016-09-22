import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router';

import CompanyList from './CompanyList';
import Pagination from '../../../main/components/Pagination';
import Icon from '../../../main/components/Icon';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CompanyStore from '../stores/CompanyStore';
import ClientConfigStore from '../../../main/stores/ClientConfigStore';
import fetchCompanies from '../actions/fetchCompanies';

const ENTER_KEY = 13;

const MESSAGES = defineMessages({
  searchCompany: {
    id: 'searchCompany',
    defaultMessage: 'Search by carrier',
  },
});

class Company extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: 0 };
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.refetchCompany = this.refetchCompany.bind(this);
  }

  componentDidMount() {
    const { executeAction, params } = this.context;
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany: '',
        pageSize: this.props.pageSize,
        pageNumber: 0,
      }
    );
    this.refetchCompany();
  }

  componentWillUnmount() {
    clearInterval(this.refetchInterval);
  }

  refetchCompany() {
    const { executeAction, params } = this.context;
    this.refetchInterval = setInterval(() => {
      executeAction(fetchCompanies,
        {
          carrierId: params.identity,
          searchCompany: this.state.searchCompany,
          pageSize: this.props.pageSize,
          pageNumber: this.state.selected,
        }
      );
    }, this.props.fetchCompanyInterval);
  }

  handleSearchChange(e) {
    if (e.keyCode === ENTER_KEY) {
      const { executeAction, params } = this.context;
      this.setState({ searchCompany: e.target.value.trim() });
      executeAction(
        fetchCompanies,
        {
          carrierId: params.identity,
          searchCompany: e.target.value.trim(),
          pageSize: this.props.pageSize,
          pageNumber: 0,
        }
      );
    }
  }
  handlePageChange(pageOptions) {
    this.context.executeAction(fetchCompanies, {
      carrierId: this.context.params.identity,
      searchCompany: this.props.searchCompany,
      ...pageOptions,
    });
  }
  render() {
    const { intl: { formatMessage } } = this.props;
    const { identity } = this.context.params;
    return (
      <div className="company" data-equalizer>
        <nav className="top-bar company-sidebar__search" data-topbar role="navigation">
          <Link to={`/${identity}/company/create`}>
            <div
              role="button"
              tabIndex="0"
              className={classNames(
              'account-top-bar__button-primary',
              'button',
              'round',
              'large',
              'item',
              'button-create',
              )
            }
            >
              <FormattedMessage
                id="createNewCompany"
                defaultMessage="Create New Company"
              />
            </div>
          </Link>
          <div>
          <input
            className="round"
            type="text"
            placeholder={formatMessage(MESSAGES.searchCompany)}
            onKeyDown={this.handleSearchChange}
          />
          <Icon symbol="icon-search" />
        </div>
        </nav>
        <div className="company-list">
          <CompanyList companies={this.props.companies} />
        </div>
        <Pagination
          pageSize={this.props.pageSize}
          pageNumber={this.props.pageNumber}
          totalElements={this.props.totalElements}
          onChange={this.handlePageChange}
        />
      </div>
    );
  }
}

Company.propTypes = {
  intl: intlShape.isRequired,
  companies: PropTypes.array,
  totalElements: PropTypes.number,
  searchCompany: PropTypes.string,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  fetchCompanyInterval: PropTypes.number,
};
Company.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
};

Company = connectToStores(Company, [CompanyStore, ClientConfigStore], (context) => ({
  companies: context.getStore(CompanyStore).getCompanies(),
  totalElements: context.getStore(CompanyStore).getTotalElements(),
  searchCompany: context.getStore(CompanyStore).getSearchCompany(),
  pageNumber: context.getStore(CompanyStore).getPageNumber(),
  pageSize: context.getStore(CompanyStore).getPageSize(),
  fetchCompanyInterval: context.getStore(ClientConfigStore).getCompanyInterval(),
}));

export default injectIntl(Company);
