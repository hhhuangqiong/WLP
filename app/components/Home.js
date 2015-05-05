import React from 'react';
import {NavLink} from 'fluxible-router';

class Home extends React.component {
  getInitialState() {
    return {};
  }

  render() {
    return (
      <div>
        <p>Home component!</p>
        <NavLink href="/signin">to sign in</NavLink>
      </div>
    );
  }
}

export default Home;
