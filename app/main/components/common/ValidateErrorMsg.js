import React, { PropTypes } from 'react';

const Message = React.createClass({
  propTypes: {
    message: PropTypes.string.isRequired,
  },

  render() {
    return (
      <div className="error-message-box">
        <span className="error">
          {this.props.message}
        </span>
      </div>
    );
  },
});

export default Message;
