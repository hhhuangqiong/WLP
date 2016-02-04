import React from 'react';
import {RouteHandler} from 'react-router';

let MainContent = React.createClass({
  shouldComponentUpdate() {
    // confirmed safe to not update this component
    return false;
  },

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
