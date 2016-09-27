import _, { merge, omit, isNull } from 'lodash';
import moment from 'moment';
import { concurrent } from 'contra';
import React, { PropTypes } from 'react';

import EndUserStore from '../stores/EndUserStore';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { injectIntl, intlShape } from 'react-intl';
import i18nMessages from '../../../main/constants/i18nMessages';
import fetchEndUser from '../actions/fetchEndUser';
import fetchEndUsers from '../actions/fetchEndUsers';
import clearEndUsers from '../actions/clearEndUsers';
import showNextPage from '../actions/showNextPage';

import * as FilterBar from './../../../main/components/FilterBar';
import SearchInput, { SUBMIT_KEY } from './../../../main/components/SearchInput';
import DateRangePicker from './../../../main/components/DateRangePicker';
import Export from './../../../main/file-export/components/Export';
import FilterBarNavigation from '../../../main/filter-bar/components/FilterBarNavigation';
import * as dateLocale from '../../../utils/dateLocale';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import EndUserExportForm from './EndUserExportForm';

import config from './../../../main/config';

const { inputDateFormat: DATE_FORMAT } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API
// page = 0 1st page
const INITIAL_PAGE_NUMBER = 0;
const MONTHS_BEFORE_TODAY = 1;
const defaultLocale = dateLocale.getDefaultLocale();

class EndUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      startDate: moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT),
      endDate: moment().endOf('day').format(DATE_FORMAT),
    };
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleBundleIdChange = this.handleBundleIdChange.bind(this);
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.checkHasNext = this.checkHasNext.bind(this);
    this.onInputChangeHandler = this.onInputChangeHandler.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleUserClick = this.handleUserClick.bind(this);
    this.loadFirstUserDetail = this.loadFirstUserDetail.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
  }

  componentDidMount() {
    const { startDate, endDate, username } = this.state;
    const { executeAction, params } = this.context;

    const payload = {
      carrierId: params.identity,
      startDate,
      endDate,
      page: this.props.page,
      username,
    };
    executeAction(fetchEndUsers, payload);
  }

  componentWillReceiveProps(nextProps) {
    const { startDate, endDate, username } = nextProps.location.query;
    const { page } = nextProps;

    const newState = {
      username: username || '',
      page,
    };
    if (startDate && startDate !== this.state.startDate) {
      newState.startDate = startDate;
    }
    if (endDate && endDate !== this.state.endDate) {
      newState.endDate = endDate;
    }

    this.setState(newState);
    if (_.isEmpty(nextProps.currentUser) && !_.isEmpty(nextProps.displayUsers)) {
      this.loadFirstUserDetail(nextProps.displayUsers);
    }
  }

  componentDidUpdate(prevProps) {
    const { location: { search } } = this.props;
    const { location: { search: prevSearch } } = prevProps;

    if (search !== prevSearch) {
      this.context.executeAction(clearEndUsers);
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearEndUsers);
  }

  onInputChangeHandler(e) {
    this.setState({ username: e.target.value });
  }

  handleBundleIdChange(e) {
    this.setState({ bundleId: e.target.value });
  }

  handleStatusChange(e) {
    this.setState({ status: e.target.value });
  }

  handleSearchSubmit(e) {
    const { username } = this.state;

    if (e.which === SUBMIT_KEY) {
      e.preventDefault();
      this.handleQueryChange({ username });
    }
  }

  handleQueryChange(newQuery) {
    const { startDate, endDate, username } = this.state;
    const query = merge(
      { startDate, endDate, page: this.props.page, username },
      newQuery,
    );
    const queryWithoutNull = omit(query, value => !value);

    const { pathname } = this.props.location;

    this.context.router.push({
      pathname,
      query: queryWithoutNull,
    });
  }

  handleEndDateChange(momentDate) {
    const date = moment(momentDate.locale(defaultLocale)).format(DATE_FORMAT);
    this.handleQueryChange({ endDate: date, page: INITIAL_PAGE_NUMBER });
  }

  handleStartDateChange(momentDate) {
    const date = moment(momentDate.locale(defaultLocale)).format(DATE_FORMAT);
    this.handleQueryChange({ startDate: date, page: INITIAL_PAGE_NUMBER });
  }

  fetchData() {
    const { startDate, endDate, username } = this.state;
    const { executeAction, params } = this.context;

    const payload = {
      carrierId: params.identity,
      startDate,
      endDate,
      page: this.props.page,
      username,
    };

    executeAction(fetchEndUsers, payload);
  }

  loadFirstUserDetail(displayUsers) {
    const currentUser = displayUsers[0];
    this.handleUserClick(currentUser);
  }

  handleUserClick(currentUser) {
    const { username } = currentUser;
    const { identity: carrierId } = this.context.params;

    this.context.executeAction(fetchEndUser, {
      carrierId,
      username,
    });
  }

  applyFilters(users) {
    let showUsers = users;
    if (isNull(users)) {
      return users;
    }

    if (this.state.bundleId) {
      showUsers = _.filter(users, user => {
        const device = _.get(user, 'devices.0') || {};
        return device.appBundleId === this.state.bundleId;
      });
    }

    if (this.state.status) {
      showUsers = _.filter(users, user => (
        user.accountStatus === this.state.status
      ));
    }

    return showUsers;
  }

  checkHasNext() {
    return this.props.hasNextPage || this.props.displayUsers < this.props.totalUsers;
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const selectedUser = this.props.currentUser;

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="end-user" tab="details" />
          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
            {/*
              <div>
              <select className="status-select top-bar-section__query-input" name="statusSelect" onChange={this.handleStatusChange}>
              <option key={'status'} value="">Choose Account Status</option>
              {accountStatus.map((status)=>{
              return <option key={status} value={status.toUpperCase()}>{status}</option>;
              })}
              </select>
              </div>
            */}
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <li className="top-bar--inner">
              <Export exportType="End_User">
                <EndUserExportForm
                  carrierId={this.context.params.identity}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                />
              </Export>
            </li>
            <li className="top-bar--inner">
              <SearchInput
                value={this.state.username}
                placeHolder={formatMessage(i18nMessages.username)}
                onInputChangeHandler={this.onInputChangeHandler}
                onKeyPressHandler={this.handleSearchSubmit}
              />
            </li>
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <div className="large-24 columns">
          <div className="large-16 columns">
            <EndUserTable
              ref="endUserTable"
              currentUser={selectedUser}
              users={this.applyFilters(this.props.displayUsers)}
              hasNext={this.checkHasNext}
              onUserClick={this.handleUserClick}
              onPageChange={this.handleShowNextPage}
              isLoading={this.props.isLoading}
            />
          </div>
          <div className="large-8 columns">
            {
              !!selectedUser ? (
                <EndUserProfile user={selectedUser} />
              ) : null
            }
          </div>
        </div>
      </div>
    );
  }
}

EndUsers.propTypes = {
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool,
  displayUsers: PropTypes.arrayOf(PropTypes.object),
  currentUser: PropTypes.object,
  hasNextPage: PropTypes.bool,
  totalUsers: PropTypes.arrayOf(PropTypes.object),
  location: PropTypes.object,
  page: PropTypes.number,
};

EndUsers.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  params: PropTypes.object,
  route: PropTypes.object,
  router: PropTypes.object,
};

EndUsers = connectToStores(EndUsers, [EndUserStore], (context) => ({
  page: context.getStore(EndUserStore).getPage(),
  totalUsers: context.getStore(EndUserStore).getTotalUsers(),
  displayUsers: context.getStore(EndUserStore).getDisplayUsers(),
  hasNextPage: context.getStore(EndUserStore).getHasNextPage(),
  currentUser: context.getStore(EndUserStore).getCurrentUser(),
  isLoading: context.getStore(EndUserStore).getIsLoading(),
}));


export default injectIntl(EndUsers);
