import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

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
      return 1;
    }

    if (this.getLastPage() - this.props.current < this.props.maxDisplay/2) {
      return _.max([this.getLastPage() - this.props.maxDisplay + 1, 1]);
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

  _goToPage: function() {
    let page = React.findDOMNode(this.refs.goPageInput).value.trim();
    if (page > 0 && page <= this.getLastPage()) {
      this.props.onPageChange(page);
    }
  },

  render: function() {
    let leftArrow = (
      <li className="arrow" onClick={_.bindKey(this.props, 'onPageChange', this.props.current - 1)}>
        <a>&#x3008;</a>
      </li>
    );

    if (this.props.current == 1) {
      leftArrow = (
        <li className="arrow unavailable" aria-disabled="true">
          <a>&#x3008;</a>
        </li>
      )
    }

    let rightArrow = (
      <li className="arrow" onClick={_.bindKey(this.props, 'onPageChange', this.props.current + 1)}>
        <a>&#x3009;</a>
      </li>
    );

    if (this.props.current == this.getLastPage()) {
      rightArrow = (
        <li className="arrow unavailable" aria-disabled="true">
          <a>&#x3009;</a>
        </li>
      )
    }

    return (
      this.props.total > 0 ? (
        <div>
          <ul className={classNames('left', 'pagination')} role="menubar" aria-label="Pagination">
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
          <form>
            <div className="row">
              <div className="large-3 columns">
                <div className="row collapse postfix-round">
                  <div className="large-13 columns">
                    <input ref="goPageInput" type="text" name="goPage" placeholder="Value" />
                  </div>
                  <div className="large-11 columns">
                    <a className="button postfix" onClick={this._goToPage}>Go</a>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : null
    );
  }
});

export default Pagination;
