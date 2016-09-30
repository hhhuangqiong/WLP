import _, { merge, omit, isNull } from 'lodash';
import moment from 'moment';
import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import EndUserStore from '../stores/EndUserStore';
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
import i18nMessages from '../../../main/constants/i18nMessages';
import config from './../../../main/config';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import EndUserExportForm from './EndUserExportForm';

const { inputDateFormat: DATE_FORMAT } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API
const MONTHS_BEFORE_TODAY = 1;
const defaultLocale = dateLocale.getDefaultLocale();
const START_DATE = moment().startOf('day').subtract(MONTHS_BEFORE_TODAY, 'month').format(DATE_FORMAT);
const END_DATE = moment().endOf('day').format(DATE_FORMAT);

class EndUsers extends React.Component {
  constructor(props) {
    super(props);
    // parse the data from query at the beginning and load it into the state
    const { startDate, endDate, username } = props.location.query;
    this.state = {
      username: username || '',
      startDate: startDate || START_DATE,
      endDate: endDate || END_DATE,
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
    this.handleShowNextPage = this.handleShowNextPage.bind(this);
  }

  componentDidMount() {
    const { startDate, endDate, username } = this.state;
    const { executeAction, params } = this.context;
    const payload = {
      carrierId: params.identity,
      page: this.props.page,
      startDate,
      endDate,
      username,
    };
    executeAction(fetchEndUsers, payload);
  }

  componentWillReceiveProps(nextProps) {
    // when search the username/date update, it will update the query, where query will be
    // the central of component state, it will be default value if missing value in query
    // so it will parse the query and set into component state
    if (nextProps.location.query !== this.props.location.query) {
      // update the state from query
      const { startDate, endDate, username } = nextProps.location.query;
      this.setState({
        username: username || '',
        startDate: startDate || START_DATE,
        endDate: endDate || END_DATE,
      });
    }

    if (_.isEmpty(nextProps.currentUser) && !_.isEmpty(nextProps.displayUsers)) {
      this.loadFirstUserDetail(nextProps.displayUsers);
    }
  }

  componentDidUpdate(prevProps) {
    const { location: { search } } = this.props;
    const { location: { search: prevSearch } } = prevProps;
    // fetch again when the query change
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
      { startDate, endDate, username },
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
    this.handleQueryChange({ endDate: date });
  }

  handleStartDateChange(momentDate) {
    const date = moment(momentDate.locale(defaultLocale)).format(DATE_FORMAT);
    this.handleQueryChange({ startDate: date });
  }

  fetchData() {
    const { startDate, endDate, username } = this.state;
    const { executeAction, params } = this.context;

    const payload = {
      carrierId: params.identity,
      page: this.props.page,
      startDate,
      endDate,
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
    return this.props.hasNextPage || this.props.displayUsers.length < this.props.totalUsers;
  }

  handleShowNextPage() {
    this.context.executeAction(showNextPage);

    if (this.props.needMoreData) {
      const { params } = this.context;
      const { startDate, endDate } = this.state;
      const { page } = this.props;

      this.context.executeAction(fetchEndUsers, {
        carrierId: params.identity,
        page: page + 1,
        startDate,
        endDate,
      });
    }
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
              hasNext={this.checkHasNext()}
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
  totalUsers: PropTypes.number,
  location: PropTypes.object,
  page: PropTypes.number,
  needMoreData: PropTypes.bool,
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
  needMoreData: context.getStore(EndUserStore).getNeedMoreData(),
}));


export default injectIntl(EndUsers);
