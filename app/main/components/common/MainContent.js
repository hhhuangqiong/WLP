import React, { PropTypes } from 'react';

const MainContent = React.createClass({
  propTypes: {
    isOffCanvas: PropTypes.bool,
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.isOffCanvas === this.props.isOffCanvas;
  },

  render() {
    return (
      <div className="row">
        <div className="large-24 columns">
          { this.props.children }
        </div>
      </div>
    );
  },
});

export default MainContent;
