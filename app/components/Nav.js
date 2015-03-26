'use strict';

import React from 'react';
import {Link} from 'react-router';

var Nav = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  render: function() {
    return (
      <ul className="pure-menu pure-menu-open pure-menu-horizontal">
        <li className={this.context.router.isActive('/') ? 'pure-menu-selected' : ''}><Link to='/'>Home</Link></li>
        <li className={this.context.router.isActive('/about') ? 'pure-menu-selected' : ''}><Link to='/about'>About</Link></li>
      </ul>
    );
  }
});

export default Nav;
