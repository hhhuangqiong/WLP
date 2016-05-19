import { PropTypes, Component } from 'react';
import getAuthorityList from '../../../modules/authority/actions/getAuthorityList';

/**
 * this is the entry point of the whole React application,
 * all the child context should be injected in order to provide
 * a more manageable position
 */

class App extends Component {
  getChildContext() {
    return {
      location: this.props.location,
      params: this.props.params,
      route: this.props.route,
    };
  }

  render() {
    return this.props.children;
  }
}

App.childContextTypes = {
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

App.contextTypes = {
  executeAction: PropTypes.func,
};

App.propTypes = {
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};

export default App;

