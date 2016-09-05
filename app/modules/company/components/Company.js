import React, { PropTypes } from 'react';
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import classNames from 'classnames';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router';

import CompanyList from './CompanyList';
import Icon from '../../../main/components/Icon';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CompanyStore from '../stores/CompanyStore';
import fetchCompanies from '../actions/fetchCompanies';

const ENTER_KEY = 13;
const PER_PAGE = 5;

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
    this.setPageRange = this.setPageRange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.setPageNumber = this.setPageNumber.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this.handleFirstPageClick = this.handleFirstPageClick.bind(this);
    this.handleLastPageClick = this.handleLastPageClick.bind(this);
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
  }

  setPageRange(start, end, interval) {
    const rangeArray = [];
    for (let i = start; i < end + 1; i += interval) {
      rangeArray.push({
        value: i,
        label: i,
      });
    }
    return rangeArray;
  }

  setPageNumber(val) {
    let selectedPage;
    const { executeAction, params } = this.context;
    const currentPageSum = Math.ceil(this.props.companies.length / val.value);
    if (currentPageSum < this.state.selected) {
      selectedPage = 0;
    } else {
      selectedPage = this.state.selected;
    }
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany: this.props.searchCompany,
        pageSize: val.value,
        pageNumber: selectedPage,
      }
    );
  }

  handleSearchChange(e) {
    if (e.keyCode === ENTER_KEY) {
      const { executeAction, params } = this.context;
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

  handlePageClick(data) {
    const selected = data.selected;
    const { pageSize, searchCompany } = this.props;
    this.setState({ selected });
    const { executeAction, params } = this.context;
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany,
        pageSize,
        pageNumber: Math.ceil(selected),
      }
    );
  }

  handleFirstPageClick() {
    this.handlePageClick({ selected: 0 });
  }

  handleLastPageClick() {
    this.handlePageClick({ selected: this.props.total - 1 });
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
        <div className="pagination-select">
          <div className="select-number">
            <Select
              className="pagination-size"
              value={this.props.pageSize}
              name="select-range"
              options={this.setPageRange(5, 15, 5)}
              onChange={this.setPageNumber}
              searchable={false}
            />
            <FormattedMessage id="recordsPerPage" defaultMessage="records per page" />
          </div>
          <div className="pagination-wrapper">
            <button className="button-pagination" onClick={this.handleFirstPageClick}>First</button>
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel={<a href="">...</a>}
              breakClassName="break-me"
              pageNum={this.props.total}
              marginPagesDisplayed={2}
              pageRangeDisplayed={PER_PAGE}
              clickCallback={this.handlePageClick}
              containerClassName="pagination-page-break"
              subContainerClassName="pages pagination-page-break"
              activeClassName="active"
              forceSelected={this.state.selected}
            />
            <button className="button-pagination" onClick={this.handleLastPageClick}>Last</button>
          </div>
        </div>
      </div>
    );
  }
}

Company.propTypes = {
  intl: intlShape.isRequired,
  companies: PropTypes.array,
  total: PropTypes.number,
  searchCompany: PropTypes.string,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
};
Company.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
};

Company = connectToStores(Company, [CompanyStore], (context) => ({
  companies: context.getStore(CompanyStore).getCompanies(),
  total: context.getStore(CompanyStore).getTotal(),
  searchCompany: context.getStore(CompanyStore).getSearchCompany(),
  pageNumber: context.getStore(CompanyStore).getPageNumber(),
  pageSize: context.getStore(CompanyStore).getPageSize(),
}));

export default injectIntl(Company);
