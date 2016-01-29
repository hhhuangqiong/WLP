import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

const debug = require('debug')('app:modules/file-export/components/ExportPanel');

export default React.createClass({
  mixins: [FluxibleMixin],

  propTypes: {
    exportId: React.PropTypes.number,
    exportTriggered: React.PropTypes.boolean,
    progress: React.PropTypes.number,
    carrierId: React.PropTypes.string,
    cancel: React.PropTypes.func,
    openModal: React.PropTypes.func,
    download: React.PropTypes.func,
    pollProgress: React.PropTypes.func
  },

  isTriggered() {
    return !!this.props.exportTriggered;
  },

  isFailed() {
    return this.exportProgress() < 0;
  },

  isCompleted() {
    return this.isTriggered() && parseInt(this.exportProgress()) === 100;
  },

  isInProgress() {
    return this.isTriggered() && !this.isFailed() && !this.isCompleted();
  },

  exportProgress() {
    return this.props.progress;
  },

  componentWillUpdate(nextProps) {
    if (!nextProps.exportTriggered || nextProps.progress === 100) {
      return;
    }

    this.props.pollProgress(nextProps.exportId, nextProps.carrierId);
  },

  renderCurrentProgress() {
    let isFailed = this.isFailed();
    let isCompleted = this.isCompleted();
    let isInProgress = this.isInProgress();

    if (isFailed) {
      return (
        <ul className="button-group round">
          <li>
            <a className="export-loading-button button">
              <span className="export-failure-text">Export failure</span>
            </a>
          </li>

          <li>
            <a className="right button" onClick={this.props.cancel}>
              <i className="icon-error left" />
            </a>
          </li>
        </ul>
      );
    }

    else if (isCompleted) {
      return (
        <div className="export-download-button export-ie-fix" onClick={this.props.download}>
          Download<span className="icon-download"></span>
        </div>
      );
    }

    else if (isInProgress) {
      return (
        <ul className="button-group round">
          <li><a className="spinner left button"></a></li>

          <li>
            <a className="export-loading-button button">
              <span className="export-loading-text">Exporting ({this.exportProgress()}%)</span>
            </a>
          </li>

          <li>
            <a className="right button" onClick={this.props.cancel}>
              <i className="icon-error left" />
            </a>
          </li>
        </ul>
      );
    }

    return (
      <div className="export-download-button export-ie-fix" onClick={this.props.openModal}>
        <span className="icon-download"></span>
      </div>
    );
  },

  render() {
    let {className} = this.props;

    return (
      <div className={className}>
        {this.renderCurrentProgress()}
      </div>
    );
  }
});
