import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import DateTimePicker from '../../../main/components/DateTimePicker';
import ExportCountriesDropdown from '../../../main/file-export/components/ExportCountriesDropdown';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

export default React.createClass({
  propTypes: {
    fromTime: React.PropTypes.object,
    toTime: React.PropTypes.object,
    handleExport: React.PropTypes.func.isRequired,
    closeModal: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return this.defaultState();
  },

  defaultState() {
    return {
      fromTime: moment(this.props.fromTime),
      toTime: moment(this.props.toTime).endOf('day'),
      origin: '',
      destination: '',
    };
  },

  clearState() {
    this.setState(this.defaultState());
  },

  handleStartDateChange(newDate) {
    this.setState({ fromTime: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleEndDateChange(newDate) {
    this.setState({ toTime: moment.isMoment(newDate) ? newDate : moment(newDate) });
  },

  handleOriginChange(event) {
    this.setState({ origin: event.target.value });
  },

  handleDestinationChange(event) {
    this.setState({ destination: event.target.value });
  },

  handleExport() {
    const params = {
      fromTime: this.state.fromTime.format('x'),
      toTime: this.state.toTime.format('x'),
      origin: this.state.origin.toLowerCase(),
      destination: this.state.destination.toLowerCase(),
    };

    this.props.handleExport(params);
    this.clearState();
  },

  render() {
    return (
      <form onSubmit={this.handleExport} noValidate>
        <h4 id="modalTitle">
          <FormattedMessage
            id="details.downloadReport"
            defaultMessage="Download Report"
          />
        </h4>

        <hr />

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="startTime"
              defaultMessage="Start time"
            />
          </label>

          <DateTimePicker
            className="export-datetime-picker export-from-time"
            name="startPicker"
            date={this.state.fromTime}
            dataPickerkey="startExportDatePicker"
            dataPickerRef="startExportDatePicker"
            dateOnChange={this.handleStartDateChange}
            dateFormat="MM/DD/YYYY"
            timeFormat="h:mm a"
          />
        </div>

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="endTime"
              defaultMessage="End time"
            />
          </label>

          <DateTimePicker
            className="export-datetime-picker export-to-time"
            name="endPicker"
            date={this.state.toTime}
            dataPickerkey="endExportDatePicker"
            dataPickerRef="endExportDatePicker"
            dateOnChange={this.handleEndDateChange}
            minDate={this.state.fromTime}
            dateFormat="MM/DD/YYYY"
            timeFormat="h:mm a"
          />
        </div>

        <ExportCountriesDropdown
          displayName="Origin"
          defaultOption="All origins"
          value={this.state.origin}
          onChange={this.handleOriginChange}
        />

        <ExportCountriesDropdown
          displayName="Destination"
          defaultOption="All destinations"
          value={this.state.destination}
          onChange={this.handleDestinationChange}
        />

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this.handleExport}
        />
      </form>
    );
  },
});
