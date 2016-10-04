import { isEmpty } from 'lodash';
import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames';
import EditableText from './EditableText';
import Pagination from '../../../../main/components/Pagination';
import Permit from '../../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../../main/acl/acl-enums';
import COMMON_MESSAGES from '../../../../main/constants/i18nMessages';
import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../../main/constants/uiState';

const TABLE_TITLES = [
  COMMON_MESSAGES.userOrMobile,
  COMMON_MESSAGES.control,
];

class WhiteList extends Component {
  constructor(props) {
    super(props);

    this.renderTableBody = this.renderTableBody.bind(this);
  }

  renderTableBody() {
    if (isEmpty(this.props.users)) {
      return (
        <tr className="empty">
          <td colSpan={TABLE_TITLES.length}>
            <div className="text-center capitalize">
              <FormattedMessage
                id="noRecordFound"
                defaultMessage="No record found"
              />
            </div>
          </td>
        </tr>
      );
    }

    return this.props.users.map(user => (
      <tr key={user.id}>
        <td>
          <EditableText
            index={user.id}
            value={user.identity}
            handleDelete={this.props.handleDelete}
          />
        </td>
        <td>
        </td>
      </tr>
    ));
  }

  render() {
    const props = this.props;
    const { identity } = this.context.params;
    const { pageSize, pageNumber, totalElements, handlePageChange } = props;

    return (
      <section className="page end-users-whitelist">
        <div className="large-24 columns">
          <table className="data-table large-24">
            <thead>
            <tr>
              <th className="username">
                <FormattedMessage
                  id="username"
                  defaultMessage="Username"
                />
              </th>
              <th className="controls">
                <Permit permission={permission(RESOURCE.WHITELIST, ACTION.CREATE)}>
                  <Link to={`/${identity}/end-user/whitelist/new`}>
                    <button className="right button round">
                      <FormattedMessage
                        id="createNewUser"
                        defaultMessage="Create New User"
                      />
                    </button>
                  </Link>
                </Permit>
              </th>
            </tr>
            </thead>
            <tbody className={classNames(
              { [UI_STATE_NORMAL]: !props.isLoading && !isEmpty(props.users) },
              { [UI_STATE_EMPTY]: !props.isLoading && isEmpty(props.users) },
              { [UI_STATE_LOADING]: props.isLoading },
            )}
            >
            { this.renderTableBody() }
            </tbody>
          </table>
          <Pagination
            pageSize={pageSize}
            pageNumber={pageNumber}
            totalElements={totalElements}
            onChange={handlePageChange}
          />
        </div>
      </section>
    );
  }
}

WhiteList.contextTypes = {
  params: PropTypes.object.isRequired,
};

WhiteList.propTypes = {
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  totalElements: PropTypes.number,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  searchValue: PropTypes.string,
  users: PropTypes.array,
  handlePageChange: PropTypes.func,
  handleDelete: PropTypes.func,
};

WhiteList.defaultProps = {
  users: [],
};

export default injectIntl(WhiteList);
