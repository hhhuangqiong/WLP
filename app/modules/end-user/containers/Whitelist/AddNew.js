import cx from 'classnames';

import { isEmpty, find, reduce, bindAll } from 'lodash';

import React, { PropTypes, Component } from 'react';
import { Link, withRouter } from 'react-router';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';
import Papa from 'papaparse';
import invariant from 'invariant';

import {
  addWhitelistUser,
  changeFilter,
  changeNewWhitelistPage,
  changeNewWhitelistPageRec,
  updateWhitelistUser,
  deleteWhitelistUser,
  clearNewWhitelist,
  startImportFile,
  completeImportFile,
} from '../../actions/whitelist';

import Pagination from '../../../../main/components/Pagination';
import EditableText from '../../components/Whitelist/EditableText';
import createWhiteListStore from '../../stores/CreateWhitelist';
import Icon from '../../../../main/components/Icon';
import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';

const LEAVE_MESSAGE = 'Leave with unsaved change?';
const UPLOAD_LIMIT = 1000;

const MESSAGES = defineMessages({
  allRecords: {
    id: 'allRecords',
    defaultMessage: 'All records',
  },
  errorRecords: {
    id: 'errorRecords',
    defaultMessage: 'Error records',
  },
  deleteText: {
    id: 'message.deleteText',
    defaultMessage: 'Are you sure to delete {value}?',
  },
  uploadLimitReached: {
    id: 'message.uploadLimitReached',
    defaultMessage: 'Total records should not be more than {limit}',
  },
});

class CreateWhiteListContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      percentage: null,
    };

    bindAll(this, [
      'handleAddNewUserClick',
      'handleChangeFilter',
      'handlePageChange',
      'getUploadedFilename',
      'getTotalPageNumber',
      'updateUserAtIndex',
      'handleUploadButtonClick',
      'handleUploadFileChange',
      'deleteWhitelistUser',
      'validateUsername',
      'updatePercentage',
      'clearPercentage',
      'renderEmptyRecord',
      'renderPageControl',
      'propmptUnsavedChangeOnTransit',
      'propmptUnsavedChangeOnClose',
      'isDirty',
    ]);
  }

  componentDidUpdate() {
    if (!window.onbeforeunload) {
      window.onbeforeunload = this.propmptUnsavedChangeOnClose;
      this.propmptUnsavedChangeOnTransit(this.isDirty());
    }
  }

  componentWillUnmount() {
    window.onbeforeunload = null;
    this.context.executeAction(clearNewWhitelist);
  }

  /**
   * @method getUploadedFilename
   * to concat uploaded files' name into a single string
   *
   * @returns {String}
   */
  getUploadedFilename() {
    const { uploadedFiles } = this.props;

    const filenames = reduce(uploadedFiles, (result, { name }) => {
      result.push(name);
      return result;
    }, []);

    return filenames.join(', ');
  }

  // TODO: handle unsaved chnages from EditableText and API request
  isDirty() {
    return true;
  }

  propmptUnsavedChangeOnTransit(isUnsaved = false) {
    const errorMessage = 'A higher order function withRouter should be used';

    invariant(this.props.router, errorMessage);
    invariant(this.props.route, errorMessage);

    // Detecting page transition (prevent leaving by setting true)
    this.props.router.setRouteLeaveHook(
      this.props.route,
      () => isUnsaved && confirm(LEAVE_MESSAGE)
    );
  }

  propmptUnsavedChangeOnClose() {
    if (this.isDirty()) {
      return LEAVE_MESSAGE;
    }

    return null;
  }

  updatePercentage(percentage) {
    this.setState({ percentage });
  }

  clearPercentage() {
    this.setState({ percentage: null });
  }

  handlePageChange({ pageSize, pageNumber }) {
    const { page, pageRec } = this.props;

    if (pageSize !== pageRec) {
      this.context.executeAction(changeNewWhitelistPageRec, pageSize);
    }
    if (pageNumber !== page) {
      this.context.executeAction(changeNewWhitelistPage, pageNumber);
    }
  }

  handleUploadButtonClick() {
    this.uploadInput.click();
  }

  handleUploadFileChange(e) {
    const { formatMessage } = this.props.intl;
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    let uploadedData = [];

    this.updatePercentage(0);

    Papa.parse(file, {
      beforeFirstChunk: () => {
        this.context.executeAction(startImportFile, file.name);
      },
      step: results => {
        const { size } = file;

        const progress = results.meta.cursor;
        const percentage = Math.round(progress / size * 100);

        this.updatePercentage(percentage);

        // TODO: change results.data[0][0] to get the correct
        // column based on the actual CSV template
        // it is now getting the second column
        const currentRow = results.data[0];
        const currentColumnByRow = currentRow[0];
        const username = this.parseUsername(currentColumnByRow);

        // DO NOT push the empty data during file import
        if (!username) {
          return;
        }

        const error = this.validateUsername(username);

        uploadedData.push({
          value: username,
          error,
        });
      },
      complete: () => {
        this.clearPercentage();

        const newNumberAfterInsert = (this.props.totalUsers + uploadedData.length);

        if (newNumberAfterInsert > UPLOAD_LIMIT) {
          uploadedData = [];

          // TODO: Make a nice looking UI dialog instead
          alert(formatMessage(MESSAGES.uploadLimitReached, { limit: UPLOAD_LIMIT }));

          return;
        }

        this.context.executeAction(completeImportFile, uploadedData);
      },
    });

    // reset the value of the hidden input
    // to make sure onChange will be fired
    // even the user selected the same file
    this.uploadInputForm.reset();
  }

  handleAddNewUserClick() {
    if (this.props.totalError > 0) {
      return;
    }

    this.context.executeAction(addWhitelistUser);
  }

  handleChangeFilter(e) {
    const { value } = e.target;
    this.context.executeAction(changeFilter, value);
  }

  updateUserAtIndex(index, user) {
    this.context.executeAction(updateWhitelistUser, {
      index,
      user: { value: this.parseUsername(user.value), error: user.error },
    });
  }

  deleteWhitelistUser(index, user) {
    const { formatMessage } = this.props.intl;

    if (!confirm(formatMessage(MESSAGES.deleteText, { value: user }))) {
      return;
    }

    this.context.executeAction(deleteWhitelistUser, index);
  }

  /**
   * @method parseUsername
   * append a leading '+' if user has none.
   *
   * @param user {String}
   * @returns {String}
   */
  parseUsername(user) {
    if (!user) {
      return '';
    }

    const firstChar = user.charAt(0);
    if (firstChar !== '+') {
      return `+${user}`;
    }
    return user;
  }

  // TODO: replace this will joi validation
  validateUsername(user, index) {
    if (!user) {
      return new Error('Username Cannot Be Empty');
    }

    const parsedUser = this.parseUsername(user);

    const validFormat = /^\+[0-9]+$/.test(parsedUser);

    if (!validFormat) {
      return new Error('Invalid Format');
    }

    const duplicated = find(
      this.props.users,
      (_user, _index) => _user.value === parsedUser && _index !== index
    );

    if (duplicated) {
      return new Error('Duplicated Records');
    }

    return null;
  }

  getTotalPageNumber() {
    const {
      pageRec,
      totalUsers,
    } = this.props;

    return totalUsers / pageRec;
  }

  renderEmptyRecord() {
    const { percentage } = this.state;
    const isUploading = Number.isFinite(percentage);

    return (
      <div className="text-center">
        {
          isUploading && (
            <div className="whitelist-progress">
              <div className="whitelist-progress__text">{percentage}%</div>
              <progress
                className="whitelist-progress__bar"
                max="100"
                value={percentage}
              ></progress>
            </div>
          )
        }
      </div>
    );
  }

  renderPageControl() {
    const {
      pageRec,
      totalUsers,
      page,
    } = this.props;

    if (totalUsers === 0) {
      return null;
    }

    return (
      <div className="end-users-whitelist__page-control">
        <Pagination
          pageSize={pageRec}
          pageNumber={page}
          totalElements={totalUsers}
          onChange={this.handlePageChange}
        />
      </div>
    );
  }

  render() {
    // TODO: move this whole block to a component
    const { formatMessage } = this.props.intl;
    const { percentage } = this.state;
    const { identity } = this.context.params;
    const {
      filter: filterValue,
      totalUsers,
      totalError,
      users,
      uploadedFiles,
    } = this.props;

    const hasError = totalError > 0;

    const isUploading = Number.isFinite(percentage);

    return (
      <div className="row">
        <FilterBar.Wrapper>
          <FilterBarNavigation section="end-user" tab="whitelist" />
        </FilterBar.Wrapper>
        <section className="page end-users-whitelist end-users-whitelist--create">
          <div className="large-24 columns">
            <header className="page__header">
              <div className="row">
                <div className="large-12 columns">
                  <h5>
                    <Link to={`/${identity}/end-user/whitelist`}>
                      <Icon className="flipped" symbol="icon-arrow" />
                    </Link>
                    <FormattedMessage
                      id="createNewUser"
                      defaultMessage="Create New User"
                    />
                  </h5>
                </div>
                <div className="large-12 columns text-right">
                  {
                    totalError > 0 && (
                      <span className="summary">
                        <FormattedMessage
                          id="numberOfError"
                          defaultMessage="Number of error(s)"
                        />
                      <span>: </span>
                      { totalError }
                      </span>
                    )
                  }
                  {
                    totalUsers > 0 && (
                      <span className="summary">
                        <FormattedMessage
                          id="numberOfUser"
                          defaultMessage="Number of users(s)"
                        />
                        <span>: </span>
                        { totalUsers }
                      </span>
                    )
                  }
                  <span>
                    <button
                      className={cx(
                        'button--extended',
                        'radius',
                        { disabled: hasError || totalUsers === 0 }
                      )}
                    >
                      <FormattedMessage
                        id="create"
                        defaultMessage="Create"
                      />
                    </button>
                  </span>
                </div>
              </div>
            </header>
          </div>
          <div className="large-24 columns">
            <section className="page__sub-header page__upload-controls">
              <div className="row">
                <div className="large-4 columns">
                  <span className="compressed-text">
                    <span>
                      <FormattedMessage
                        id="batchCreation"
                        defaultMessage="Batch Creation"
                      />
                    </span>
                    <span>
                      <a
                        className="resource"
                        target="_blank"
                        href="/static/whitelist-template.csv"
                      >
                        <FormattedMessage
                          id="downloadTemplate"
                          defaultMessage="Download Template"
                        />
                      </a>
                    </span>
                  </span>
                </div>
                <div className="large-20 columns">
                  <div className="row">
                    <div className="large-5 columns">
                      <button
                        className="button--no-background button--extended radius"
                        onClick={this.handleUploadButtonClick}
                      >
                        <FormattedMessage
                          id="uploadCsv"
                          defaultMessage="Upload CSV"
                        />
                      </button>
                      <form ref={c => { this.uploadInputForm = c; }}>
                        <input
                          ref={c => { this.uploadInput = c; }}
                          className="hide"
                          type="file"
                          accept=".csv"
                          onChange={this.handleUploadFileChange}
                        />
                      </form>
                    </div>
                    <div className="large-19 columns">
                      {
                        uploadedFiles ? (
                          <span className="compressed-text">
                            <span>
                              <FormattedMessage
                                id="uploadedFiles"
                                defaultMessage="Uploaded Files"
                              />
                              : { uploadedFiles.length }
                            </span>
                            <span>
                              <a className="resource">
                                { this.getUploadedFilename() }
                              </a>
                            </span>
                          </span>
                        ) : null
                      }
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="large-24 columns">
            <section className="page__contents">
              <table className="data-table large-24">
                <thead>
                  <tr>
                    <th className="column--username">
                      <FormattedMessage
                        id="phoneNumber"
                        defaultMessage="Phone Number"
                      />
                    </th>
                    <th className="column--controls text-right">
                      <div className="row">
                        <div className="large-12 columns">
                          <div className="row">
                            <div className="large-6 columns">
                              <label>
                                <FormattedMessage
                                  id="filter"
                                  defaultMessage="Filter"
                                />
                                <span>:</span>
                              </label>
                            </div>
                            <div className="large-18 columns">
                              <select value={filterValue} onChange={this.handleChangeFilter}>
                                <option value="all">
                                  {formatMessage(MESSAGES.allRecords)}
                                </option>
                                <option value="error">
                                  {formatMessage(MESSAGES.errorRecords)}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="large-12 columns">
                          <div className="text-right">
                            <button
                              className={cx(
                                'button--no-background',
                                'button--extended',
                                'radius',
                                { disabled: hasError }
                              )}
                              onClick={this.handleAddNewUserClick}
                            >
                              <FormattedMessage
                                id="addUser"
                                defaultMessage="Add User"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                {
                  isUploading || isEmpty(users) ? (
                    <tr className="empty">
                      <td colSpan="2">
                        {this.renderEmptyRecord()}
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={users.length - index}
                        className={cx({ 'row--error': !!user.error })}
                      >
                        <td colSpan="2">
                          <EditableText
                            index={index}
                            value={user.value}
                            error={user.error}
                            handleValidation={this.validateUsername}
                            handleUpdate={this.updateUserAtIndex}
                            handleDelete={this.deleteWhitelistUser}
                          />
                        </td>
                      </tr>
                    ))
                  )
                }
                </tbody>
              </table>

              {this.renderPageControl()}

            </section>
          </div>
        </section>
      </div>
    );
  }
}

CreateWhiteListContainer.contextTypes = {
  executeAction: PropTypes.func,
  params: PropTypes.object,
  location: PropTypes.object,
};

CreateWhiteListContainer.propTypes = {
  intl: intlShape.isRequired,
  filter: PropTypes.string,
  isLoading: PropTypes.bool,
  page: PropTypes.number,
  pageRec: PropTypes.number,
  totalError: PropTypes.number,
  totalUsers: PropTypes.number,
  users: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    error: PropTypes.object,
  })),
  uploadedFiles: PropTypes.array,
  uploadingFile: PropTypes.object,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

CreateWhiteListContainer.defaultProps = {
  page: 0,
  pageRec: 10,
};

export default connectToStores(
  withRouter(injectIntl(CreateWhiteListContainer)),
  [createWhiteListStore],
    context => context.getStore(createWhiteListStore).getState()
);
