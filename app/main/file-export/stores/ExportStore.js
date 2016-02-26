import { createStore } from 'fluxible/addons';

const debug = require('debug')('app:modules/file-export/stores/ExportStore');
const PROGRESS_FAILED_INDICATOR = -1;

export default createStore({
  storeName: 'ExportStore',

  handlers: {
    FETCH_EXPORT_SUCCESS: 'handleFetchExport',
    FETCH_EXPORT_CANCEL_SUCCESS: 'handleExportCancelled',
    FETCH_EXPORT_PROGRESS_FAILURE: 'handleProgressFailure',
    FETCH_EXPORT_PROGRESS_SUCCESS: 'handleProgressSuccess',
  },

  initialize() {
    this.exportJobs = {};
  },

  handleFetchExport(payload) {
    debug('exportId', payload.id);

    // there is only one export job at this moment
    this.exportJobs[payload.exportType] = [];

    this
      .exportJobs[payload.exportType]
      .push({
        exportId: payload.id,
        exportTriggered: true,
        /** To determine whether a progress is failed or not. */
        progress: !payload.id ? PROGRESS_FAILED_INDICATOR : 0,
      });

    this.emitChange();
  },

  handleExportCancelled() {
    this.initialize();
    this.emitChange();
  },

  handleProgressSuccess(payload) {
    const currentJob = this.getExportJobs(payload.exportType)[0];
    currentJob.progress = payload && payload.progress ?
      parseInt(payload.progress, 10) :
      PROGRESS_FAILED_INDICATOR;

    this.emitChange();
  },

  handleProgressFailure(payload) {
    const currentJob = this.getExportJobs(payload.exportType)[0];

    currentJob.progress = PROGRESS_FAILED_INDICATOR;
    currentJob.exportTriggered = false;

    debug(payload);

    this.emitChange();
  },

  getExportJobs(exportType) {
    return this.exportJobs[exportType];
  },

  getState() {
    return {
      exportJobs: this.exportJobs,
    };
  },

  dehydrate() {
    return this.getState();
  },

  rehydrate(state) {
    this.exportJobs = state.exportJobs;
  },
});
