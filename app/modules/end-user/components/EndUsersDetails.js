import _, { merge, omit } from 'lodash';
import moment from 'moment';
import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

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
import Permit from '../../../main/components/common/Permit';

import EndUserTable from './EndUserTable';
import EndUserProfile from './EndUserProfile';
import EndUserExportForm from './EndUserExportForm';

const { inputDateFormat: DATE_FORMAT } = config;

// See: https://issuetracking.maaii.com:9443/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API
const defaultLocale = dateLocale.getDefaultLocale();
const START_DATE = moment().startOf('day').subtract(1, 'month').format(DATE_FORMAT);
const END_DATE = moment().endOf('day').format(DATE_FORMAT);

class EndUsers extends React.Component {
  constructor(props) {
    super(props);

    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleUserClick = this.handleUserClick.bind(this);
    this.loadFirstUserDetail = this.loadFirstUserDetail.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this);
    this.handleShowNextPage = this.handleShowNextPage.bind(this);
  }

  componentDidMount() {
    this.fetchEndUsers();
  }

  componentWillReceiveProps(nextProps) {
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
      this.fetchEndUsers();
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearEndUsers);
  }

  loadDataFromQuery() {
    const { query: { startDate, endDate, username } } = this.props.location;
    return {
      username: username || '',
      startDate: startDate || START_DATE,
      endDate: endDate || END_DATE,
    };
  }

  handleSearchSubmit(e) {
    if (e.which === SUBMIT_KEY) {
      e.preventDefault();
      this.handleQueryChange({ username: e.target.value });
    }
  }

  handleQueryChange(newQuery) {
    const { startDate, endDate, username } = this.loadDataFromQuery();
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

  fetchEndUsers() {
    const { startDate, endDate, username } = this.loadDataFromQuery();
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

  handleShowNextPage() {
    this.context.executeAction(showNextPage);

    if (this.props.needMoreData) {
      const { params } = this.context;
      const { startDate, endDate } = this.loadDataFromQuery();
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
    const { startDate, endDate, username } = this.loadDataFromQuery();

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="end-user" tab="details" />
          <FilterBar.LeftItems>
            <DateRangePicker
              withIcon
              startDate={startDate}
              endDate={endDate}
              handleStartDateChange={this.handleStartDateChange}
              handleEndDateChange={this.handleEndDateChange}
            />
          </FilterBar.LeftItems>
          <FilterBar.RightItems>
            <Permit permission={permission(RESOURCE.END_USER_EXPORT, ACTION.READ)}>
              <li className="top-bar--inner">
                <Export exportType="End_User">
                  <EndUserExportForm
                    carrierId={this.context.params.identity}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </Export>
              </li>
            </Permit>
            <li className="top-bar--inner">
              <SearchInput
                defaultValue={username}
                placeHolder={formatMessage(i18nMessages.username)}
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
              users={this.props.displayUsers}
              hasNext={this.props.hasNextPage}
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
