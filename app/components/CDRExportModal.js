import {CLIENT} from '../../app/utils/env';
import React from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';
import CDRExportForm from './CDRExportForm';
import moment from 'moment';

let CDRExportModal = React.createClass({
  getInitialState(){
    return { isOpen: this.props.isOpen }
  },

  componentWillReceiveProps(newProps) {
    this.setState({ isOpen: newProps.isOpen });
  },

  componentWillMount(){
    if (CLIENT)
      Modal.setAppElement(document.getElementById('app'));
  },

  closeModal(){
    this.setState({ isOpen: false });
  },

  render() {
    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={this.closeModal}
        className="ReactModal__Content export-modal"
      >
        <CDRExportForm
          startDate={moment(this.props.startDate, 'L')}
          endDate={moment(this.props.endDate, 'L').endOf('day')}
          netType={this.props.netType}
          handleModalClose={this.closeModal}
          handleExport={this.props.handleExport}
        />
      </Modal>
    )
  }
})

export default CDRExportModal;