import classnames from 'classnames';
import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

class Pagination extends Component {
  renderFooter() {
    if (this.props.isLoading) {
      return (
        <div>
          <FormattedMessage
            id="loading"
            defaultMessage="Loading"
          />
          <span>...</span>
        </div>
      );
    }

    return (
      <FormattedMessage
        id="loadMore"
        defaultMessage="Load More"
      />
    );
  }

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
              <FormattedMessage
                id="details.noMore"
                defaultMessage="No more"
              />
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td colSpan={colSpan}>
          <div className="pagination text-center">
            <span
              className={classnames(
                'pagination__button', { 'pagination__button--disabled': isLoading }
              )}
              onClick={onLoadMore}
            >
              {this.renderFooter()}
            </span>
          </div>
        </td>
      </tr>
    );
  }
}

Pagination.propTypes = {
  hasMoreData: PropTypes.bool.isRequired,
  colSpan: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  onLoadMore: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default Pagination;
