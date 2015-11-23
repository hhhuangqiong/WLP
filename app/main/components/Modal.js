import React, { Component } from 'react';
import moment from 'moment';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import ReactModal from 'react-modal';
import {CLIENT} from '../../utils/env';

export default class Modal extends Component {
  componentWillMount(){
    if (CLIENT) {
      ReactModal.setAppElement(document.getElementById('app'));
    }
  }

  getDefaultProps() {
    return {
      isOpened: false
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
