import cx from 'classnames';

import { isEmpty, find, reduce, bindAll } from 'lodash';

import React, { PropTypes, Component } from 'react';
import { Link, withRouter } from 'react-router';
import { injectIntl, intlShape } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';
import Papa from 'papaparse';
import invariant from 'invariant';

import {
  addWhitelistUser,
  changeFilter,
  changeNewWhitelistPage,
  changeNewWhitelistPageRec,
  updateWhitelistUser,
  clearNewWhitelist,
  startImportFile,
  completeImportFile,
} from '../../actions/whitelist';

import EditableText from '../../components/Whitelist/EditableText';
import createWhiteListStore from '../../stores/CreateWhitelist';
import Icon from '../../../../main/components/Icon';
import * as FilterBar from '../../../../main/components/FilterBar';
import FilterBarNavigation from '../../../../main/filter-bar/components/FilterBarNavigation';
import NumericPagination from '../../../data-table/components/NumericPagination';

const LEAVE_MESSAGE = 'Leave with unsaved change?';

class CreateWhiteListContainer extends Component {
  constructor(props) {
    super(props);

    bindAll(this, [
      'handleAddNewUserClick',
      'handleChangeFilter',
      'handlePageChange',
      'handlePageRecChange',
      'getUploadedFilename',
      'updateUserAtIndex',
      'handleUploadButtonClick',
      'handleUploadFileChange',
      'validateUsername',
      'propmptUnsavedChangeOnTransit',
      'propmptUnsavedChangeOnClose',
      'isDirty',
    ]);
  }

  componentDidUpdate() {
    window.onbeforeunload = this.propmptUnsavedChangeOnClose;
    this.propmptUnsavedChangeOnTransit(this.isDirty());
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

  handlePageChange(page) {
    this.context.executeAction(changeNewWhitelistPage, page);
  }

  handlePageRecChange(pageRec) {
    this.context.executeAction(changeNewWhitelistPageRec, pageRec);
  }

  handleUploadButtonClick() {
    this.uploadInput.click();
  }

  handleUploadFileChange(e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const uploadedData = [];

    Papa.parse(file, {
      beforeFirstChunk: () => {
        this.context.executeAction(startImportFile, file.name);
      },
      step: results => {
        // TODO: change results.data[0][1] to get the correct
        // column based on the actual CSV template
        // it is now getting the second column
        const username = this.parseUsername(results.data[0][1]);

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
      user,
    });
  }

  /**
   * @method parseUsername
   * to remove the first char from a string if it is a '+' symbol
   *
   * @param user {String}
   * @returns {String}
   */
  parseUsername(user) {
    if (!user) {
      return '';
    }

    const firstChar = user.charAt(0);

    if (firstChar === '+') {
      return user.substr(1, user.length);
    }

    return user;
  }

  // TODO: replace this will joi validation
  validateUsername(user) {
    if (!user) {
      return new Error('Username Cannot Be Empty');
    }

    const validFormat = /^[0-9]*$/.test(user);

    if (!validFormat) {
      return new Error('Invalid Format');
    }

    const duplicated = find(this.props.users, _user => _user.value === user);

    if (duplicated) {
      return new Error('Duplicated Records');
    }

    return null;
  }

  render() {
    // TODO: move this whole block to a component
    const { role, identity } = this.context.params;
    const {
      filter: filterValue,
      page,
      pageRec,
      totalError,
      totalUsers,
      users,
      uploadedFiles,
      uploadingFile,
    } = this.props;
    const hasError = totalError > 0;

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
                    <Link to={`/${role}/${identity}/end-user/whitelist`}>
                      <Icon className="flipped" symbol="icon-arrow" />
                    </Link>
                    Create New User
                  </h5>
                </div>
                <div className="large-12 columns text-right">
                  <span className="summary">
                    Number of error(s): { totalError }
                  </span>
                  <span className="summary">
                    Number of user(s): { totalUsers }
                  </span>
                  <span>
                    <button
                      className={cx(
                        'button--extended',
                        'radius',
                        { disabled: hasError || totalUsers === 0 }
                      )}
                    >Create</button>
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
                    <span>Batch Creation</span>
                    <span>
                      <a className="resource">Download Template</a>
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
                        Upload CSV file
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
                            <span>Uploaded Files: { uploadedFiles.length }</span>
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
                      Phone Number
                    </th>
                    <th className="column--controls text-right">
                      <div className="row">
                        <div className="large-12 columns">
                          <div className="row">
                            <div className="large-6 columns">
                              <label>Filter:</label>
                            </div>
                            <div className="large-18 columns">
                              <select value={filterValue} onChange={this.handleChangeFilter}>
                                <option value="all">All records</option>
                                <option value="error">Error records</option>
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
                            >Add User</button>
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                {
                  !isEmpty(uploadingFile) || isEmpty(users) ? (
                    <tr className="empty">
                      <td colSpan="2">
                        <p className="text-center">
                          {
                            !isEmpty(uploadingFile) ? (
                              <span>Processing ...</span>
                            ) : null
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr
                        key={isEmpty(user.value) || !!user.error ? Math.random() : user.value}
                        className={cx({ 'row--error': !!user.error })}
                      >
                        <td colSpan="2">
                          <EditableText
                            index={index}
                            value={user.value}
                            error={user.error}
                            handleTextValidation={this.validateUsername}
                            handleTextUpdate={this.updateUserAtIndex}
                          />
                        </td>
                      </tr>
                    ))
                  )
                }
                </tbody>
              </table>
              <NumericPagination
                pageRec={pageRec}
                totalRec={totalUsers}
                current={page}
                onPageChange={this.handlePageChange}
                onPageRecChange={this.handlePageRecChange}
              />
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
  page: 1,
  pageRec: 10,
};

export default connectToStores(
  withRouter(injectIntl(CreateWhiteListContainer)),
  [createWhiteListStore],
    context => context.getStore(createWhiteListStore).getState()
);
