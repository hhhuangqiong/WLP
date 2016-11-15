import React, { PropTypes, Component } from 'react';
import { find, get, bindAll } from 'lodash';
import { injectIntl, intlShape } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';
import WhiteList from '../../components/Whitelist/List';
import AuthStore from '../../../../main/stores/AuthStore';
import WhiteListStore from '../../stores/Whitelist';
import { clearWhitelist } from '../../actions/whitelist';
import fetchSignupRules from '../../actions/fetchSignupRules';
import deleteSignupRule from '../../actions/deleteSignupRule';
import { RESOURCE, ACTION, permission } from '../../../../main/acl/acl-enums';
import CommonDialog from '../../../../main/components/CommonDialog';
import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';
import SearchBox, { SUBMIT_KEY } from '../../../../main/components/Searchbox';
import COMMON_MESSAGES from '../../../../main/constants/i18nMessages';
import { MESSAGES } from '../../constants/i18n';

class WhiteListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDeleteDialogOpen: false,
      deletingUser: null,
      search: '',
    };

    bindAll(this, [
      'handlePageChange',
      'handleSearchKeyPress',
      'handleDelete',
      'handleOpenDeleteDialog',
      'handleCloseDeleteDialog',
    ]);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRefetchRequired) {
      const { pageSize, pageNumber } = this.props;
      this.fetchData({ pageSize, pageNumber, identity: this.state.search });
    }
  }

  componentWillUnmount() {
    this.context.executeAction(clearWhitelist);
  }

  fetchData(query = {}) {
    const { identity } = this.context.params;
    this.context.executeAction(fetchSignupRules, {
      carrierId: identity,
      query,
    });
  }

  hasDeletePermission() {
    const permissions = get(this.props.user, 'permissions', []);
    return permissions.indexOf(permission(RESOURCE.WHITELIST, ACTION.DELETE)) >= 0;
  }

  handleSearchKeyPress(e) {
    const value = e.target.value.trim();
    this.setState({ search: value });

    if (e.which === SUBMIT_KEY) {
      this.fetchData({ identity: value });
    }
  }

  handlePageChange({ pageSize, pageNumber }) {
    this.fetchData({ pageSize, pageNumber, identity: this.state.search });
  }

  handleOpenDeleteDialog(id) {
    const deletingUser = find(this.props.users, (user) => user.id === id) || {};
    this.setState({ isDeleteDialogOpen: true, deletingUser });
  }

  handleCloseDeleteDialog() {
    this.setState({ isDeleteDialogOpen: false, deletingUser: null });
  }

  handleDelete() {
    const { identity } = this.context.params;
    this.context.executeAction(deleteSignupRule, {
      carrierId: identity,
      id: this.state.deletingUser.id,
    });
    this.setState({ isDeleteDialogOpen: false, deletingUser: null });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { isDeleteDialogOpen, deletingUser } = this.state;
    const deletingUserName = deletingUser ? deletingUser.identity : '';
    const dialogMessage = formatMessage(MESSAGES.deleteDialogMessage, { name: deletingUserName });

    return (
      <div className="row">
        <CommonDialog
          isOpen={isDeleteDialogOpen}
          onCancel={this.handleCloseDeleteDialog}
          onConfirm={this.handleDelete}
          cancelLabel={formatMessage(COMMON_MESSAGES.cancel)}
          confirmLabel={formatMessage(COMMON_MESSAGES.delete)}
          dialogHeader={formatMessage(MESSAGES.deleteDialogHeader)}
        >
          <div className="dialog-info">
              <span
                dangerouslySetInnerHTML={{ __html: dialogMessage }}
              />
          </div>
        </CommonDialog>
        <FilterBar.Wrapper>
          <FilterBarNavigation section="end-user" tab="whitelist" />
          <FilterBar.RightItems>
            <SearchBox
              value={this.state.search}
              placeHolder={formatMessage(COMMON_MESSAGES.mobile)}
              onKeyPressHandler={this.handleSearchKeyPress}
            />
          </FilterBar.RightItems>
        </FilterBar.Wrapper>
        <WhiteList
          {...this.props}
          handlePageChange={this.handlePageChange}
          handleDelete={this.hasDeletePermission() ? this.handleOpenDeleteDialog : null}
        />
      </div>
    );
  }
}

WhiteListContainer.contextTypes = {
  executeAction: PropTypes.func,
  params: PropTypes.object,
};

WhiteListContainer.propTypes = {
  intl: intlShape.isRequired,
  isRefetchRequired: PropTypes.bool,
  isLoading: PropTypes.bool,
  users: PropTypes.array,
  totalElements: PropTypes.number,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  // current login user from AuthStore
  user: PropTypes.object.isRequired,
};

WhiteListContainer.defaultProps = {
  pageSize: 10,
};

export default connectToStores(
  injectIntl(WhiteListContainer),
  [AuthStore, WhiteListStore],
  context => ({
    ...context.getStore(WhiteListStore).getState(),
    user: context.getStore(AuthStore).getUser(),
  })
);
