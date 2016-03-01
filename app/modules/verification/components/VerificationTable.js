import React, { PropTypes } from 'react';
import VerificationTableRow from './VerificationTableRow';
import VerificationProfile from './VerificationProfile';

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

  renderPaginationFooter() {
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
              <th>DATE &amp; TIME</th>
              <th>MOBILE</th>
              <th>SOURCE IP</th>
              <th>METHOD</th>
              <th>OS</th>
              <th>DEVICE MODEL</th>
              <th>OPERATOR</th>
              <th>RESULT</th>
              <th className="text-center">REMARKS</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="verification-table">
            {this.renderTableRows(this.props.verifications)}
          </tbody>
          <tfoot>
          <tr>
            <td colSpan="10" className="pagination">
              {this.renderPaginationFooter()}
            </td>
          </tr>
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
