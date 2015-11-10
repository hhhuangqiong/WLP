import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import _ from 'lodash';

import DatePicker from '../../../main/components/DatePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

export default React.createClass({
  propTypes: {
    carrierId: React.PropTypes.string,
    startDate: React.PropTypes.string,
    endDate: React.PropTypes.string,
    handleExport: React.PropTypes.func.isRequired,
    closeModal: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
    };
  },

  clearState() {
    this.setState(this.getInitialState());
  },

  handleStartDateChange(newDate) {
    this.setState({ startDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleEndDateChange(newDate) {
    this.setState({ endDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleExport() {
    let params = {
      carrierId: this.props.carrierId,
      startDate: this.state.startDate.format('L'),
      endDate: this.state.endDate.format('L'),
      pageNumberIndex: 0,
    };

    this.props.handleExport(params);
    this.clearState();
  },

  render() {
    return (
      <form onSubmit={this.handleExport} noValidate>
        <h4 id="modalTitle">DOWNLOAD REPORT</h4>

        <hr />

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Start time</label>
          </div>

          <div className="large-7 columns">
            <DatePicker
              name="startPicker"
              selectedDate={this.state.startDate}
              dataPickerkey="startExportDatePicker"
              dataPickerRef="startExportDatePicker"
              onChange={this.handleStartDateChange}
              dateFormat="MM/DD/YYYY"
            />

          </div>
        </div>

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">End time</label>
          </div>

          <div className="large-7 columns">
            <DatePicker
              name="endPicker"
              selectedDate={this.state.endDate}
              dataPickerkey="endExportDatePicker"
              dataPickerRef="endExportDatePicker"
              onChange={this.handleEndDateChange}
              dateFormat="MM/DD/YYYY"
            />
          </div>
        </div>

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />

      </form>
    )
  }
});
