import React from 'react';
import {RouteHandler} from 'react-router';

let MainContent = React.createClass({
  render: function() {
    return (
      <div className="row">
        <div className="large-24 columns">
          <RouteHandler/>
        </div>
      </div>
    );
  }
});

export default MainContent;
