import React, { createClass, PropTypes, cloneElement } from 'react';
import { first } from 'lodash';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import Modal from 'react-modal';

import { CLIENT } from '../../../utils/env';

import fetchExport from '../actions/fetchExport';
import fetchExportCancel from '../actions/fetchExportCancel';
import fetchExportProgress from '../actions/fetchExportProgress';
import ExportStore from '../stores/ExportStore';
import ExportPanel from './ExportPanel';

const debug = require('debug')('app:modules/file-export/components/Export');
const UPDATE_PROGRESS_TIMEOUT = 500;

export default createClass({
  propTypes: {
    exportType: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
  },

  contextTypes: {
    router: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ExportStore],
  },

  getInitialState() {
    return this.defaultState();
  },

  componentWillMount() {
    if (CLIENT) Modal.setAppElement(document.getElementById('app'));
  },

  onChange() {
    // Assume the exportJob to be one due to current UI settings
    const exportJobs = this.context.getStore(ExportStore).getExportJobs(this.props.exportType);
    const exportJob = first(exportJobs);

    if (exportJob) {
      debug('onChange', exportJob);
      this.setState(exportJob);
    }
  },

  render() {
    const ExportForm = cloneElement(this.props.children, {
      handleExport: this.handleExport,
      closeModal: this.closeModal,
    });

    return (
      <div>
        <Modal
          isOpen={this.state.modalOpened}
          onRequestClose={this.closeModal}
          className="ReactModal__Content modal"
        >
          {ExportForm}
        </Modal>

        <ExportPanel
          className="export-panel export-ie-fix"
          exportId={this.state.exportId}
          exportTriggered={this.state.exportTriggered}
          progress={this.state.progress}
          carrierId={this.state.carrierId}
          cancel={this.cancel}
          openModal={this.openModal}
          download={this.download}
          pollProgress={this.pollProgress}
        />
      </div>
    );
  },

  download() {
    const downloadPath = `/export/${this.state.carrierId}/file?exportId=${this.state.exportId}`;
    window.open(downloadPath);

    this.clearExportState();
  },

  clearExportState() {
    this.setState(this.defaultState());
  },

  cancel() {
    const data = { exportId: this.state.exportId, carrierId: this.state.carrierId };

    clearTimeout(this.pollingTimeout);
    this.setState(this.defaultState());
    this.executeAction(fetchExportCancel, data);
  },

  openModal() {
    this.setState({ modalOpened: true });
  },

  closeModal() {
    this.setState({ modalOpened: false });
  },

  pollProgress(exportId, carrierId) {
    const data = { exportId, carrierId, exportType: this.props.exportType };

    this.pollingTimeout = setTimeout(() => {
      this.executeAction(fetchExportProgress, data);
    }, UPDATE_PROGRESS_TIMEOUT);
  },

  handleExport(params) {
    debug('handleExport', params);

    const { identity } = this.context.router.getCurrentParams();

    // For Progress Bar
    this.setState({ carrierId: identity });

    params.carrierId = identity;
    params.exportType = this.props.exportType;

    this.executeAction(fetchExport, params);
    this.closeModal();
  },

  defaultState() {
    return {
      exportId: 0,
      progress: 0,
      exportTriggered: false,
      modalOpened: false,
    };
  },

});
