import React, { createClass, PropTypes } from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

export default createClass({
  propTypes: {
    exportId: PropTypes.number,
    exportTriggered: PropTypes.bool,
    progress: PropTypes.number,
    carrierId: PropTypes.string,
    cancel: PropTypes.func,
    openModal: PropTypes.func,
    download: PropTypes.func,
    pollProgress: PropTypes.func,
    className: PropTypes.string,
  },

  mixins: [FluxibleMixin],

  componentWillUpdate(nextProps) {
    if (!nextProps.exportTriggered || nextProps.progress === 100) return;
    this.props.pollProgress(nextProps.exportId, nextProps.carrierId);
  },

  renderCurrentProgress() {
    const isFailed = this.isFailed();
    const isCompleted = this.isCompleted();
    const isInProgress = this.isInProgress();

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
    } else if (isCompleted) {
      return (
        <div className="export-download-button export-ie-fix" onClick={this.props.download}>
          Download<span className="icon-download"></span>
        </div>
      );
    } else if (isInProgress) {
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
      <div className="interactive-button export-download-button export-ie-fix" onClick={this.props.openModal}>
        <span className="icon-download"></span>
      </div>
    );
  },

  render() {
    const { className } = this.props;

    return (
      <div className={className}>
        {this.renderCurrentProgress()}
      </div>
    );
  },

  isTriggered() {
    return !!this.props.exportTriggered;
  },

  isFailed() {
    return this.exportProgress() < 0;
  },

  isCompleted() {
    return this.isTriggered() && parseInt(this.exportProgress(), 10) === 100;
  },

  isInProgress() {
    return this.isTriggered() && !this.isFailed() && !this.isCompleted();
  },

  exportProgress() {
    return this.props.progress;
  },
});
