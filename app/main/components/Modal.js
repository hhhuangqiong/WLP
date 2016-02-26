import React, { PropTypes, Component } from 'react';
import ReactModal from 'react-modal';
import { CLIENT } from '../../utils/env';

export default class Modal extends Component {
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

  render() {
    return (
      <ReactModal className="modal" isOpen={this.props.isOpen}>
        <If condition={this.props.title}>
          <label className="modal-header">
            <h4 className="modal-header-title">{this.props.title}</h4>
          </label>
        </If>

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
