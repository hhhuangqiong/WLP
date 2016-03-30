import React, { PropTypes, Component } from 'react';

/**
 * this is the entry point of the whole React application,
 * all the child context should be injected in order to provide
 * a more manageable position
 */

export default class App extends Component {
  static childContextTypes = {
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      location: this.props.location,
      params: this.props.params,
      route: this.props.route,
    };
  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        { this.props.children }
      </div>
    )
  }
}
