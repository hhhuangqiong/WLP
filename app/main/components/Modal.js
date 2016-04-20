import React, { PropTypes, Component } from 'react';
import ReactModal from 'react-modal';
import { FormattedMessage } from 'react-intl';

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

  renderTitleSection() {
    if (!(this.props.title || this.props.titleId)) {
      return null;
    }

    return (
      <label className="modal-header">
        <h4 className="modal-header-title">
          {this.renderTitleContent()}
        </h4>
      </label>
    );
  }

  renderTitleContent() {
    const {
      title, titleId,
    } = this.props;

    if (titleId) {
      return <FormattedMessage id={titleId} defaultMessage={title} />;
    }

    return title;
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
  titleId: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
  ]),
  className: PropTypes.string,
};
