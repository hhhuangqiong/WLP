import React from 'react';

export default React.createClass({
  render() {
    return (
      <div className="widget-container">
        <h2 className="widget-not-found text-center">
          <span className="icon-error6"></span>
          <span className="widget-not-found__title">Dashboard is not available!</span>
        </h2>
      </div>
    );
  }
});
