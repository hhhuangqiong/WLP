import React, { PropTypes } from 'react';
import moment from 'moment';
import classNames from 'classnames';

import DateTimePicker from '../../../main/components/DateTimePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

import CALL_TYPE from '../constants/callType';

export default React.createClass({
  propTypes: {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    netType: PropTypes.string,
    handleExport: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
  },

  defaultState() {
    return {
      startDate: moment(this.props.startDate),
      endDate: moment(this.props.endDate).endOf('day'),
      netType: this.props.netType,
      destination: '',
    };
  },

  getInitialState() {
    return this.defaultState();
  },

  clearState() {
    this.setState(this.defaultState());
  },

  handleStartDateChange(newDate) {
    this.setState({ startDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleEndDateChange(newDate) {
    this.setState({ endDate: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleToggleOnnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.ONNET ? CALL_TYPE.ONNET : '' });
  },

  handleToggleOffnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.OFFNET ? CALL_TYPE.OFFNET : '' });
  },

  handleToggleMaaiiIn(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== CALL_TYPE.MAAII_IN ? CALL_TYPE.MAAII_IN : '' });
  },

  handleDestinationChange(event) {
    this.setState({ destination: event.target.value });
  },

  handleExport() {
    const params = {
      type: this.state.netType,
      startDate: this.state.startDate.format('x'),
      endDate: this.state.endDate.format('x'),
      destination: this.state.destination.toLowerCase(),
    };

    this.props.handleExport(params);
    this.clearState();
  },

  render() {
    // ExportCountryDropdown is removed for WLP-285
    return (
      <form onSubmit={this.handleExport} noValidate>
        <h4 id="modalTitle">DOWNLOAD REPORT</h4>

        <hr />

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Start time</label>
          </div>

          <div className="large-7 columns">
            <DateTimePicker
              className="export-datetime-picker export-from-time"
              name="startPicker"
              date={this.state.startDate}
              dataPickerkey="startExportDatePicker"
              dataPickerRef="startExportDatePicker"
              dateOnChange={this.handleStartDateChange}
              dateFormat="MM/DD/YYYY"
              timeFormat="h:mm a"
            />

          </div>
        </div>

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">End time</label>
          </div>

          <div className="large-7 columns">
            <DateTimePicker
              className="export-datetime-picker export-to-time"
              name="endPicker"
              date={this.state.endDate}
              dataPickerkey="endExportDatePicker"
              dataPickerRef="endExportDatePicker"
              dateOnChange={this.handleEndDateChange}
              dateFormat="MM/DD/YYYY"
              timeFormat="h:mm a"
            />
          </div>
        </div>

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Type</label>
          </div>

          <div className="large-7 columns">
            <ul className="button-group round even-3 export-type-buttons">
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.ONNET })}
                  onClick={this.handleToggleOnnet}
                >Onnet</a>
              </li>
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.OFFNET })}
                  onClick={this.handleToggleOffnet}
                >Offnet</a>
              </li>
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === CALL_TYPE.MAAII_IN })}
                  onClick={this.handleToggleMaaiiIn}
                >Maaii-in</a>
              </li>
            </ul>
          </div>
        </div>

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />

      </form>
    );
  },
});
