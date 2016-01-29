import React, { PropTypes } from 'react';

import VerificationTableRow from './VerificationTableRow';

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
    onLoadMoreClick: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      verifications: []
    };
  },

  renderTableRows: function() {
    return this.props.verifications.map(item => {
      return (
        <VerificationTableRow key={item.id} verification={item} />
      );
    });
  },

  renderPaginationFooter: function() {
    if (this.props.verifications.length < this.props.total) {
      return (<div className="pagination__button text-center" onClick={this.props.onLoadMoreClick}>Load More</div>);
    } else {
      return (<div className="pagination__button pagination__button--inactive text-center">no more result</div>);
    }
  },

  render: function() {
    return (
      <table className="data-table small-24 large-22 large-offset-1">
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
          </tr>
        </thead>
        <tbody className="verification-table">
          {this.renderTableRows(this.props.verifications)}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="9" className="pagination">
              {this.renderPaginationFooter()}
            </td>
          </tr>
        </tfoot>
      </table>
    );
  }
});
