import { isEmpty } from 'lodash';
import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames';
import NumericPagination from '../../../data-table/components/NumericPagination';
import i18nMessages from '../../../../main/constants/i18nMessages';
import {
  UI_STATE_LOADING,
  UI_STATE_EMPTY,
  UI_STATE_NORMAL,
} from '../../../../main/constants/uiState';

const TABLE_TITLES = [
  i18nMessages.userOrMobile,
  i18nMessages.control,
];

class WhiteList extends Component {
  constructor(props) {
    super(props);

    this.renderTableBody = this.renderTableBody.bind(this);
  }

  renderTableBody() {
    if (this.props.isLoading) {
      return (
        <tr>
          <td colSpan={TABLE_TITLES.length}>
            <div className="text-center capitalize">
              <FormattedMessage
                id="loading"
                defaultMessage="loading"
              />
              <span>...</span>
            </div>
          </td>
        </tr>
      );
    }

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
      <tr key={user}>
        <td>
          { user }
        </td>
        <td>
        </td>
      </tr>
    ));
  }

  render() {
    const props = this.props;
    const { role, identity } = this.context.params;
    const { page, pageRec, totalUsers } = props;

    return (
      <section className="page end-users-whitelist">
        <div className="large-24 columns">
          <table className="data-table large-24">
            <thead>
            <tr>
              <th className="column--username">
                Username
              </th>
              <th className="column--controls">
                <Link to={`/${role}/${identity}/end-user/whitelist/new`}>
                  <button className="right">
                    Create New User
                  </button>
                </Link>
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
          {
            !props.isLoading ? (
              <NumericPagination
                pageRec={pageRec}
                totalRec={totalUsers}
                current={page}
                onPageChange={props.handlePageChange}
                onPageRecChange={props.handlePageRecChange}
              />
            ) : null
          }
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
  page: PropTypes.number,
  pageRec: PropTypes.number,
  searchValue: PropTypes.string,
  users: PropTypes.array,
  totalUsers: PropTypes.number,
  handleSearchSubmit: PropTypes.func,
  handlePageChange: PropTypes.func,
  handlePageRecChange: PropTypes.func,
};

WhiteList.defaultProps = {
  page: 1,
  pageRec: 10,
  users: [],
};

export default injectIntl(WhiteList);
