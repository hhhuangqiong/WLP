import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import ReactPaginate from 'react-paginate';
import classNames from 'classnames';

function Pagination(props) {
  const {
    totalElements,
    displayedPages,
    pageSize,
    pageSizeOptions,
    pageNumber,
    onChange,
    disabled,
  } = props;
  const pageSizeSelectItems = pageSizeOptions.map(o => ({
    label: o,
    value: o,
  }));
  const totalPages = Math.ceil(totalElements / pageSize);
  function onPageNumberChange(selectedPageNumber) {
    onChange({
      pageSize,
      pageNumber: selectedPageNumber,
    });
  }
  function onPageSizeChange(selectedPageSize) {
    const newTotalPages = Math.ceil(totalElements / selectedPageSize.value);
    onChange({
      pageSize: selectedPageSize.value,
      pageNumber: Math.min(totalPages - 1, newTotalPages - 1),
    });
  }
  return (
    <div className={classNames('pagination-select', { disabled })}>
      <div className="select-number">
        <Select
          className="pagination-size"
          value={pageSize}
          name="select-range"
          options={pageSizeSelectItems}
          onChange={onPageSizeChange}
          searchable={false}
          disabled={disabled}
        />
        <FormattedMessage id="recordsPerPage" defaultMessage="records per page" />
      </div>
      <div className="pagination-wrapper">
        <button className="button-pagination" onClick={() => onPageNumberChange(0)}>
          <FormattedMessage id="first" defaultMessage="First" />
        </button>
        <ReactPaginate
          previousLabel="<"
          nextLabel=">"
          breakLabel={<a href="">...</a>}
          breakClassName="break-me"
          pageNum={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={displayedPages}
          clickCallback={item => onPageNumberChange(item.selected)}
          containerClassName="pagination-page-break"
          subContainerClassName="pages pagination-page-break"
          activeClassName="active"
          forceSelected={pageNumber}
        />
        <button className="button-pagination" onClick={() => onPageNumberChange(totalPages - 1)}>
          <FormattedMessage id="last" defaultMessage="Last" />
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  totalElements: PropTypes.number,
  displayedPages: PropTypes.number,
  pageSize: PropTypes.number,
  pageNumber: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

Pagination.defaultProps = {
  displayedPages: 5,
  pageSizeOptions: [5, 10, 15],
  disabled: false,
};

export default Pagination;
