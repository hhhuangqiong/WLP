import React from 'react';

const Message = React.createClass({
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
