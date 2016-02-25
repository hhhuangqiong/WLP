import { isEmpty } from 'lodash';
import React, { PropTypes } from 'react';
import VerificationTableRow from './VerificationTableRow';
import VerificationProfile from './VerificationProfile';
import EmptyRow from '../../../main/components/data-table/EmptyRow';

import Pagination from '../../../main/components/Pagination';

const TABLE_TITLES = [
  'DATE &amp; TIME',
  'MOBILE',
  'SOURCE IP',
  'METHOD',
  'OS',
  'DEVICE MODEL',
  'OPERATOR',
  'RESULT',
  'REMARKS',
  '',
];

export default React.createClass({
  propTypes: {
    /**
     * Verification records
     * @type {Object[]}
     */
    verifications: PropTypes.array.isRequired,
    /**
     * Total number of verifications
     * @type {Number}
     */
    total: PropTypes.number.isRequired,
    /**
     * Callback for loading more content
     * @type {Function}
     */
    onLoadMoreClick: PropTypes.func.isRequired,
    isLoadingMore: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      verifications: [],
    };
  },

  getInitialState() {
    return {
      selectedProfile: null,
    };
  },

  onClickProfile(selectedProfile) {
    this.setState({ selectedProfile });
  },

  onClickBackButton() {
    this.setState({ selectedProfile: null });
  },

  renderTableRows() {
    const { verifications } = this.props;

    return verifications.map(item =>
      (
        <VerificationTableRow
          key={item.id}
          verification={item}
          onClickProfile={this.onClickProfile}
        />
      )
    );
  },

  renderEmptyRow() {
    if (!this.props.verifications || this.props.verifications.length === 0) {
      return <EmptyRow colSpan={10} />;
    }
  },

  renderPaginationFooter: function () {
    if (this.props.verifications.length < this.props.total) {
      return (
        <div
          className="pagination__button text-center"
          onClick={this.props.onLoadMoreClick}
        >Load More</div>
      );
    }

    return (
      <div
        className="pagination__button pagination__button--inactive text-center"
      >no more result</div>
    );
  },

  render() {
    const { selectedProfile } = this.state;

    return (
      <If condition={!selectedProfile}>
        <table className="verification-report data-table small-24 large-22 large-offset-1">
          <thead>
            <tr>
              {
                TABLE_TITLES.map(title => <th className="im-table--cell">{title}</th>)
              }
            </tr>
          </thead>
          <tbody className="verification-table">
            {_.isEmpty(this.renderTableRows()) ? this.renderEmptyRow() : this.renderTableRows()}
          </tbody>
          <tfoot>
            <If condition={!isEmpty(this.props.verifications)}>
              <Pagination
                colSpan={TABLE_TITLES.length + 1}
                hasMoreData={this.props.verifications.length < this.props.total}
                onLoadMore={this.props.onLoadMoreClick}
                isLoading={this.props.isLoadingMore}
              />
            </If>
          </tfoot>
        </table>
      <Else />
        <VerificationProfile
          profile={selectedProfile}
          onClickBack={this.onClickBackButton}
        />
      </If>
    );
  },
});
