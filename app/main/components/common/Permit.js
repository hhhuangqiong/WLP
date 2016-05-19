import { PropTypes, Component } from 'react';
import invariant from 'invariant';

class Permit extends Component {
  componentWillMount() {
    invariant(
      this.props.children,
      'Authority should have at least 1 child component'
    );
  }

  _hasAuthority() {
    const { action, resource } = this.props;
    const { authorityChecker } = this.context;
    return authorityChecker.scan(action, resource);
  }

  render() {
    return this._hasAuthority() ? this.props.children : null;
  }
}

Permit.propTypes = {
  children: PropTypes.any.isRequired,
  action: PropTypes.string.isRequired,
  resource: PropTypes.string.isRequired,
};

Permit.contextTypes = {
  authorityChecker: PropTypes.object.isRequired,
};

export default Permit;
