import React, { PropTypes } from 'react';
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import { FormattedMessage } from 'react-intl';

import CompanyList from './CompanyList';
import Icon from '../../../main/components/Icon';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CompanyStore from '../stores/CompanyStore';
import fetchCompanies from '../actions/fetchCompanies';

const ENTER_KEY = 13;
const PER_PAGE = 5;
class Company extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: 0 };
    this._setPageRange = this._setPageRange.bind(this);
    this._handleSearchChange = this._handleSearchChange.bind(this);
    this._setPageNum = this._setPageNum.bind(this);
    this._handlePageClick = this._handlePageClick.bind(this);
  }

  componentDidMount() {
    const { executeAction, params } = this.context;
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany: '',
        limit: this.props.limit,
        offset: 0,
      }
    );
  }

  _setPageRange(start, end) {
    const rangeArray = [];
    for (let i = start; i < end + 1; i++) {
      rangeArray.push({
        value: i,
        label: i,
      });
    }
    return rangeArray;
  }

  _handleSearchChange(e) {
    if (e.keyCode === ENTER_KEY) {
      const { executeAction, params } = this.context;
      executeAction(
        fetchCompanies,
        {
          carrierId: params.identity,
          searchCompany: e.target.value.trim(),
        }
    );
    }
  }

  _setPageNum(val) {
    const { executeAction, params } = this.context;
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany: this.props.searchCompany,
        limit: val.value,
        offset: this.state.selected ? this.state.selected * val.value : 0,
      }
    );
  }

  _handlePageClick(data) {
    const selected = data.selected;
    const { limit, searchCompany } = this.props;
    this.setState({ selected });
    const { executeAction, params } = this.context;
    executeAction(fetchCompanies,
      {
        carrierId: params.identity,
        searchCompany,
        limit,
        offset: Math.ceil(selected * this.props.limit),
      }
    );
  }

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
        <div className="company-list">
          <CompanyList companies={this.props.companies} />
        </div>
        <div className="pagination-select">
          <div className="react-select">
            <Select
              value={this.props.limit}
              name="select-range"
              options={this._setPageRange(0, 10)}
              onChange={this._setPageNum}
            />
          </div>
          <FormattedMessage id="recordsPerPage" defaultMessage="records per page" />
          <ReactPaginate
            previousLabel="previous"
            nextLabel="next"
            breakLabel={<a href="">...</a>}
            breakClassName="break-me"
            pageNum={this.props.pageNum}
            marginPagesDisplayed={2}
            pageRangeDisplayed={PER_PAGE}
            clickCallback={this._handlePageClick}
            containerClassName="pagination-company"
            subContainerClassName="pages pagination-company"
            activeClassName="active"
          />
        </div>
      </div>
    );
  }
}

Company.propTypes = {
  companies: PropTypes.array,
  pageNum: PropTypes.number,
  searchCompany: PropTypes.string.isRequired,
  offset: PropTypes.number,
  limit: PropTypes.string,
};
Company.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
};

Company = connectToStores(Company, [CompanyStore], (context) => ({
  companies: context.getStore(CompanyStore).getCompanies(),
  pageNum: context.getStore(CompanyStore).getPageNumn(),
  searchCompany: context.getStore(CompanyStore).getSearchCompany(),
  offset: context.getStore(CompanyStore).getOffSet(),
  limit: context.getStore(CompanyStore).getLimit(),
}));

export default Company;
