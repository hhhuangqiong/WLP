import React, { PropTypes, Component } from 'react';
import ReactModal from 'react-modal';

import { CLIENT } from '../../utils/env';

export default class Modal extends Component {
  static contextType = {
    intl: PropTypes.object,
  };

  getDefaultProps() {
    return {
      isOpened: false,
    };
  }

  componentWillMount() {
    if (CLIENT) {
      ReactModal.setAppElement(document.getElementById('app'));
    }
  }

  renderTitleSection() {
    if (!(this.props.title)) {
      return null;
    }

    return (
      <label className="modal-header">
        <h4 className="modal-header-title">
          {this.props.title}
        </h4>
      </label>
    );
  }

  render() {
    return (
      <ReactModal className="modal" isOpen={this.props.isOpen}>
        {this.renderTitleSection()}
        <div className="modal-content">{this.props.children}</div>
      </ReactModal>
    );
  }
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
  ]),
  className: PropTypes.string,
};
