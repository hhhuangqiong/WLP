import React from 'react';

export default React.createClass({
  propTypes: {
    closeModal: React.PropTypes.func,
    handleExport: React.PropTypes.func
  },

  render() {
    return (
      <div className="row text-center export-submit-buttons">
        <a
          role="button"
          className="button--secondary large"
          aria-label="Close"
          onClick={(e) => {
            e.preventDefault();
            this.props.closeModal();
          }}

        >Cancel</a>

        <div className="extra-space"></div>

        <a
          role="button"
          aria-label="submit form"
          className="button--primary large"
          onClick={(e) => {
            e.preventDefault();
            this.props.handleExport();
          }}

        >Proceed</a>
      </div>
    );
  }
});
