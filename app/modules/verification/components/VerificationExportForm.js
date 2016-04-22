import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import DateTimePicker from '../../../main/components/DateTimePicker';
import ExportSubmitControls from '../../../main/file-export/components/ExportSubmitControls';

export default class VerificationExportForm extends Component {
  static propTypes = {
    verificationType: PropTypes.string,
    osType: PropTypes.string,
    handleExport: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    handleVerificationMethodChange: PropTypes.func.isRequired,
    transformVerificationTypes: PropTypes.func.isRequired,
    defaultOption: PropTypes.string,
    verificationTypes: PropTypes.array,
    handleOsTypeChange: PropTypes.func.isRequired,
    osTypes: PropTypes.array,
  };

  constructor(props) {
    super();

    this._resetState = this._resetState.bind(this);
    this._handleStartDateChange = this._handleStartDateChange.bind(this);
    this._handleEndDateChange = this._handleEndDateChange.bind(this);
    this._export = this._export.bind(this);

    this.state = this._resetState(props);
  }

  _handleStartDateChange(newDate) {
    this.setState({ fromTime: moment.isMoment(newDate) ? newDate : moment(newDate) });
  }

  _handleEndDateChange(newDate) {
    this.setState({ toTime: moment.isMoment(newDate) ? newDate : moment(newDate) });
  }

  _resetState(props) {
    return {
      verificationType: '',
      osType: '',
      fromTime: moment(props.fromTime),
      toTime: moment(props.toTime).endOf('day'),
    };
  }

  _export() {
    const params = {
      from: this.state.fromTime.format('x'),
      to: this.state.toTime.format('x'),
      verificationType: this.props.verificationType,
      osType: this.props.osType,
    };

    this.props.handleExport(params);
    this._resetState(this.props);
  }

  render() {
    return (
      <form onSubmit={this._export} noValidate>
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
            dateOnChange={this._handleStartDateChange}
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
            dateOnChange={this._handleEndDateChange}
            minDate={this.state.fromTime}
            dateFormat="MM/DD/YYYY"
            timeFormat="h:mm a"
          />
        </div>

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="vsdk.details.method"
              defaultMessage="Verification Method"
            />
          </label>

          <select
            className="large export-countries-dropdown radius"
            value={this.props.verificationType}
            onChange={this.props.handleVerificationMethodChange}
          >
            <option>{this.props.defaultOption}</option>
            {this.props.verificationTypes.map(type => (
              <option key={type} value={type}>
                {this.props.transformVerificationTypes(type)}
              </option>
            ))}
          </select>
        </div>

        <div className="export-row">
          <label className="left bold">
            <FormattedMessage
              id="vsdk.details.osType"
              defaultMessage="OS Type"
            />
          </label>

          <select
            className="large export-countries-dropdown radius"
            value={this.props.osType}
            onChange={this.props.handleOsTypeChange}
          >
            <option>{this.props.defaultOption}</option>
            {
              this.props.osTypes.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))
            }
          </select>
        </div>

        <hr />

        <ExportSubmitControls
          closeModal={this.props.closeModal}
          handleExport={this._export}
        />
      </form>
    );
  }
}
