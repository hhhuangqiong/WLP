import React, { PropTypes } from 'react';
import Invariant from 'react/lib/invariant';

export default React.createClass({
  contextTypes: {
    getAuthority: PropTypes.func.isRequired
  },

  componentWillMount: function() {
    Invariant(
      this.props.children,
      'Authority should have at least 1 child component'
    );
  },

  _checkAuthority: function() {
    let { action, resource } = this.props;

    let authority = this.context.getAuthority();
    return authority.scan(action, resource);
  },

  render: function() {
    return (
      <If condition={!this._checkAuthority()}>
        { null }
      <Else />
        { this.props.children }
      </If>
    )
  }

});
