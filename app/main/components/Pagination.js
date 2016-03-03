import classnames from 'classnames';
import React, { Component, PropTypes } from 'react';

export default class Pagination extends Component {
  static propTypes = {
    hasMoreData: PropTypes.bool.isRequired,
    colSpan: PropTypes.string.isRequired,
    onLoadMore: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  render() {
    const {
      hasMoreData,
      onLoadMore,
      isLoading,
      colSpan,
    } = this.props;

    if (!hasMoreData) {
      return (
        <tr>
          <td colSpan={colSpan}>
            <div className="pagination text-center">
              No more
            </div>
          </td>
        </tr>
      )
    }

    return (
      <tr>
        <td colSpan={colSpan}>
          <div className="pagination text-center">
            <span
              className={classnames('pagination__button', { 'pagination__button--disabled': isLoading })}
              onClick={onLoadMore}
            >{ isLoading ? 'Loading...' : 'Load More' }</span>
          </div>
        </td>
      </tr>
    );
  }
}
