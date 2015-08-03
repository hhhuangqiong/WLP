import {CLIENT} from '../../app/utils/env';
import React from 'react';
import classNames from 'classnames';
import Modal from 'react-modal';
import CDRExportForm from './CDRExportForm';
import moment from 'moment';

let CDRExportModal = React.createClass({

  componentWillMount(){
    if (CLIENT)
      Modal.setAppElement(document.getElementById('app'));
  },

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.handleModalClose}
        className="ReactModal__Content export-modal"
      >
        <CDRExportForm
          startDate={moment(this.props.startDate, 'L')}
          endDate={moment(this.props.endDate, 'L').endOf('day')}
          netType={this.props.type}
          handleModalClose={this.props.handleModalClose}
          handleExport={this.props.handleExport}
        />
      </Modal>
    )
  }
})

export default CDRExportModal;
