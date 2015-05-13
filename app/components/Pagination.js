import React from 'react';
import {FluxibleMixin} from 'fluxible';

var Pagination = React.createClass({
  getInitialState: function () {
    return {

    };
  },
  getDefaultProps: function() {
    return {
      from: 1,
      to: 10,
      current: 1
    };
  },
  render: function() {

    let pages = [];
    for (let i = this.props.from; i <= this.props.to; ++i) {
      pages.push( <li key={i} className={this.props.current == i ? "selected":null}><a href="">{i}</a></li> );
    }

    return (
      <ul className="pagination" role="menubar" aria-label="Pagination">
        <li className="arrow unavailable" aria-disabled="true"><a href="">&lt;</a></li>
        {pages}
        <li className="arrow"><a href="">&gt;</a></li>
      </ul>
    );
  }
});

export default Pagination;
