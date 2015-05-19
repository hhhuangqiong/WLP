import React from 'react';
import {Link} from 'react-router';

class Home extends React.component {
  getInitialState() {
    return {};
  }

  render() {
    return (
      <div>
        <p>Home component!</p>
        <Link href="/signin">to sign in</Link>
      </div>
    );
  }
}

export default Home;
