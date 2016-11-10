import { PropTypes, Component } from 'react';
import invariant from 'invariant';
import connectToStores from 'fluxible-addons-react/connectToStores';

import AuthStore from './../../stores/AuthStore';

class Permit extends Component {
  componentWillMount() {
    invariant(this.props.children, 'Authority should have at least 1 child component');
  }

  hasAccess() {
    if (!this.props.user) {
      return false;
    }
    const permissions = this.props.user.permissions || [];
    return permissions.indexOf(this.props.permission) >= 0;
  }

  render() {
    return this.hasAccess() ? this.props.children : null;
  }
}

Permit.propTypes = {
  user: PropTypes.object,
  permission: PropTypes.string,
  children: PropTypes.element,
};

Permit = connectToStores(Permit, [AuthStore], (context) => (
  { user: context.getStore(AuthStore).getUser() }
));

export default Permit;
