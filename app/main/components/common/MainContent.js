import React from 'react';
import { RouteHandler } from 'react-router';

const MainContent = React.createClass({
  render() {
    return (
      <div className="row">
        <div className="large-24 columns">
          <RouteHandler/>
        </div>
      </div>
    );
  },
});

export default MainContent;
