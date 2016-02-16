import React, { PropTypes } from 'react';
import Invariant from 'react/lib/invariant';

export default React.createClass({
  propTypes: {
    children: PropTypes.any.isRequired,
    action: PropTypes.string.isRequired,
    resource: PropTypes.string.isRequired,
  },

  contextTypes: {
    getAuthority: PropTypes.func.isRequired,
  },

  componentWillMount() {
    Invariant(
      this.props.children,
      'Authority should have at least 1 child component'
    );
  },

  render() {
    return (
      <If condition={!this._hasAuthority()}>
        { null }
      <Else />
        { this.props.children }
      </If>
    );
  },

  _hasAuthority() {
    const { action, resource } = this.props;

    const authority = this.context.getAuthority();
    return authority.scan(action, resource);
  },
});
