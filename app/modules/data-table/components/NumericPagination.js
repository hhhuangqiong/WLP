import { range } from 'lodash';
import React, { Component, PropTypes } from 'react';

class Pagination extends Component {
  constructor(props) {
    super(props);

    this.getTotalPages = this.getTotalPages.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.onPageRecChange = this.onPageRecChange.bind(this);
  }

  onPageChange(page) {
    const { onPageChange } = this.props;
    onPageChange && onPageChange(page);
  }

  onPageRecChange(e) {
    const { onPageRecChange } = this.props;
    const pageRec = e.target.value;

    if (!!pageRec) {
      onPageRecChange && onPageRecChange(pageRec);
    }
  }

  getPageStart() {
    const totalPages = getTotalPages();

    return
  }

  getTotalPages() {
    const { pages, totalRec, pageRec } = this.props;

    if (typeof pages !== 'undefined') {
      return pages;
    }

    return Math.ceil(totalRec / pageRec);
  }

  render() {
    const { pageRec, pageRecOptions } = this.props;

    return (
      <section className="pagination">
        <div className="row">
          <div className="large-12 columns">
            <div className="row">
              <div className="large-4 columns large-collapse">
                <select onChange={this.onPageRecChange} value={pageRec}>
                  {
                    pageRecOptions.map(_pageRec => (
                      <option value={_pageRec}>{ _pageRec }</option>
                    ))
                  }
                </select>
              </div>
              <div className="large-20 columns">
                <label>records per page</label>
              </div>
            </div>
          </div>
          <div className="large-12 columns">
            <ul>
              <li>First</li>
              {
                range(1, this.getTotalPages() + 1).map(page => <li>{ page }</li>)
              }
              <li>Last</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }
}

Pagination.propTypes = {
  pages: PropTypes.number,
  totalRec: PropTypes.number,
  pageRec: PropTypes.number.isRequired,
  pageRecOptions: PropTypes.array,
  current: PropTypes.number.isRequired,
  onPageRecChange: PropTypes.func,
};

Pagination.defaultProps = {
  pageRec: 10,
  pageRecOptions: [10, 25, 50],
};

export default Pagination;
