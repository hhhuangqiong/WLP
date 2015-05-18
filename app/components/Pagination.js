import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

const maxDisplay = 10;

var Pagination = React.createClass({
  getInitialState: function () {
    return {
      current: this.props.current,
      per: this.props.per,
      total: this.props.total
    };
  },

  getDefaultProps: function() {
    return {
      current: 1,
      total: 0,
      per: 10
    };
  },

  getLastPage: function() {
    return Math.ceil(this.props.total / this.props.per);
  },

  getFromPage: function() {
    if (this.getLastPage() - this.props.current < maxDisplay/2) {
      return this.getLastPage() - maxDisplay + 1;
    }

    return _.max([this.props.current + 1 - maxDisplay/2, 1]);
  },

  getToPage: function() {
    if (this.getLastPage() - this.props.current <= maxDisplay/2) {
      return this.getLastPage();
    }

    return _.min([this.getLastPage(), _.max([this.props.current + maxDisplay/2, maxDisplay])]);
  },

  getAvailablePages: function() {
    let pages = [];

    let _from = this.getFromPage();
    let _to = this.getToPage();

    for (let i = _from; i <= _to; ++i) {
      pages.push(i);
    }

    return pages;
  },

  goToPage: function() {
    let page = this.refs.goInput.getDOMNode().value.trim();
    this.props.onPageChange(page);
  },

  render: function() {
    return (
      <ul className="pagination" role="menubar" aria-label="Pagination">
        <li className={classNames('arrow', { 'unavailable': this.props.current == 1 })} aria-disabled="true"><a href="">&lt;</a></li>
        {this.getAvailablePages().map((i)=>{
          return (
            <li key={i} className={classNames({'active': this.props.current == i})} onClick={_.bindKey(this.props, 'onPageChange', i)}>
              <a>{i}</a>
            </li>
          );
        })}
        <li className={classNames('arrow', { 'unavailable': this.props.current == this.getLastPage() })}><a href="">&gt;</a></li>
      </ul>
    );
  }
});

export default Pagination;
