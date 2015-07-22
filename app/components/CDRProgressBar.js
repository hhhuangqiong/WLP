import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import fetchExportProgress from '../actions/fetchExportProgress';

const debug = require('debug')('app:component/CDRProgressBar');

let CDRProgressBar = React.createClass({
  mixins: [FluxibleMixin],

  propTypes: {
    exportProgress: React.PropTypes.number
  },

  handleExportProgressOnChange(exportId, carrierId) {
    debug('handleExportProgressOnChange', exportId, carrierId)
    let data = {}

    data.exportId = exportId;
    data.carrierId = carrierId;

    setTimeout(
      ( () => this.executeAction(fetchExportProgress, data, ()=>{}) ).bind(this), 500
    );
  },

  componentDidMount() {
    if(!this.props.isExporting || this.props.exportProgress === 100)
      return;

    this.handleExportProgressOnChange(this.props.exportId, this.props.carrierId);
  },

  render() {
    let {className} = this.props;
    let exportElement;

    let isExporting = !!this.props.isExporting;
    let startExport = isExporting && this.props.exportProgress < 100;
    let exportFail = isExporting && this.props.exportProgress < 0;

    let exportProgress = this.props.exportProgress;

    if(startExport){
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
              <i className="icon-error left" />
            </a>
          </li>
        </ul>
      )
    }

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
              <i className="icon-error left" />
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
