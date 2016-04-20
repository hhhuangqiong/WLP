import React from 'react';
import { FormattedMessage } from 'react-intl';

export default React.createClass({
  render() {
    return (
      <div className="widget-container">
        <h2 className="text-center">
          <span className="icon-error6"></span>
          <span className="widget-not-found__title">
            Dashboard is coming soon
          </span>
        </h2>
      </div>
    );
  },
});
