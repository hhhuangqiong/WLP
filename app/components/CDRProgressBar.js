import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import fetchExportProgress from '../actions/fetchExportProgress';

const debug = require('debug')('app:component/CDRProgressBar');

const UPDATE_PROGRESS_TIMEOUT = 500;

let CDRProgressBar = React.createClass({
  mixins: [FluxibleMixin],

  propTypes: {
    exportProgress: React.PropTypes.number
  },

  isExporting() {
    return this.props.isExporting && this.props.exportProgress <100;
  },

  pollProgress(exportId, carrierId) {
    let data = {
      exportId,
      carrierId
    };

    setTimeout(() => {
      this.executeAction(fetchExportProgress, data, ()=> {})
     }, UPDATE_PROGRESS_TIMEOUT);
  },

  componentDidUpdate (prevProps, prevState) {
    if (this.isExporting()) {
      this.pollProgress(prevProps.exportId, prevProps.carrierId);
    }
  },

  componentDidMount() {
    if(!this.props.isExporting || this.props.exportProgress === 100)
      return;

    this.pollProgress(this.props.exportId, this.props.carrierId);
  },

  render() {
    let {className} = this.props;
    let exportElement;

    let isExporting = this.isExporting();

    let exportProgress = this.props.exportProgress;

    // fails if exportProgress is not a valid progress
    let exportFail = exportProgress < 0;


    if(exportFail){
      exportElement = (
        <ul className="button-group round export-loading-wrapper">
          <li>
            <a className="export-loading-button button">
              <span className="export-failure-text">Export failure</span>
            </a>
          </li>

          <li>
            <a
              className="right button"
              onClick={this.props.handleCancelExport}
            >
              <span className="icon-error left" />
            </a>
          </li>
        </ul>
      )
    }
    else if(isExporting){

      exportElement = (
        <ul className="button-group round export-loading-wrapper">
          <li><a className="spinner left button"></a></li>
          <li>
            <a className="export-loading-button button">
              <span className="export-loading-text">Exporting ({exportProgress}%)</span>
            </a>
          </li>

          <li>
            <a
              className="right button"
              onClick={this.props.handleCancelExport}
            >
              <span className="icon-error left" />
            </a>
          </li>
        </ul>
      )
    }


    return (
      <div className={className}>
        {exportElement}
      </div>
    )
  }
});

export default CDRProgressBar;
