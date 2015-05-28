import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

const maxDisplay = 10;

var Pagination = React.createClass({
  propTypes: {
    current: React.PropTypes.number.isRequired,
    per: React.PropTypes.number.isRequired
  },

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
      per: 10,
      maxDisplay: 10
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.props = nextProps;
  },

  getLastPage: function() {
    return Math.ceil(this.props.total / this.props.per);
  },

  getFromPage: function() {
    if (this.getLastPage() <= this.props.maxDisplay/2) {
      return this.getLastPage();
    }

    if (this.getLastPage() - this.props.current < this.props.maxDisplay/2) {
      return this.getLastPage() - this.props.maxDisplay + 1;
    }

    return _.max([this.props.current + 1 - this.props.maxDisplay/2, 1]);
  },

  getToPage: function() {
    if (this.getLastPage() - this.props.current <= this.props.maxDisplay/2) {
      return this.getLastPage();
    }

    return _.min([this.getLastPage(), _.max([this.props.current + this.props.maxDisplay/2, this.props.maxDisplay])]);
  },

  getAvailablePages: function() {
    let pages = [];

    if (this.props.total > 0) {
      let _from = this.getFromPage();
      let _to = this.getToPage();

      for (let i = _from; i <= _to; ++i) {
        pages.push(i);
      }
    }

    return pages;
  },

  goToPage: function() {
    let page = this.refs.goInput.getDOMNode().value.trim();
    this.props.onPageChange(page);
  },

  render: function() {
    let leftArrow = (
      <li className="arrow" onClick={_.bindKey(this.props, 'onPageChange', this.props.current - 1)}>
        <a href="">&#x3008;</a>
      </li>
    );

    if (this.props.current == 1) {
      leftArrow = (
        <li className="arrow unavailable" aria-disabled="true">
          <a href="">&#x3008;</a>
        </li>
      )
    }

    let rightArrow = (
      <li className="arrow" onClick={_.bindKey(this.props, 'onPageChange', this.props.current + 1)}>
        <a href="">&#x3009;</a>
      </li>
    );

    if (this.props.current == this.getLastPage()) {
      rightArrow = (
        <li className="arrow unavailable" aria-disabled="true">
          <a href="">&#x3009;</a>
        </li>
      )
    }

    return (
      <ul className={classNames('pagination', { 'hide': this.props.total == 0 })} role="menubar" aria-label="Pagination">
        {leftArrow}
        {this.getAvailablePages().map((i)=>{
          return (
            <li key={i} className={classNames({'current': this.props.current == i})} onClick={_.bindKey(this.props, 'onPageChange', i)}>
              <a>{i}</a>
            </li>
          );
        })}
        {rightArrow}
      </ul>
    );
  }
});

export default Pagination;
