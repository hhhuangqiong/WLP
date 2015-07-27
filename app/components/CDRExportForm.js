import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import _ from 'lodash';

import DateTimePicker from './DateTimePicker';
import Countries from '../data/countries.json';

let CDRExportForm = React.createClass({
  getInitialState(){
    moment().local();

    return {
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      netType: this.props.netType
    }
  },

  componentWillReceiveProps(newProps) {
    this.setState({
      startDate: newProps.startDate,
      endDate: newProps.endDate,
      netType: newProps.netType
    });
  },

  proceedExport() {
    if (typeof this.props.handleExport === 'function') {
      this.props.handleExport(this.state);
      this.props.handleModalClose();
    }
  },

  startDateOnChange(date) {
    this.setState({ startDate: moment(date) });
  },

  endDateOnChange(date) {
    this.setState({ endDate: moment(date) });
  },

  startTimeOnChange(value) {
    this.setState({ startDate: moment(value) });
  },

  endTimeOnChange(value) {
    this.setState({ endDate: moment(value) });
  },

  toggleNetType(netType) {
    this.setState({ netType: netType });
  },

  toggleNetTypeOnnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== 'ONNET' ? 'ONNET' : '' });
  },

  toggleNetTypeOffnet(e) {
    e.preventDefault();
    this.setState({ netType: this.state.netType !== 'OFFNET' ? 'OFFNET' : '' });
  },

  destinationChange(event) {
    this.setState({ destination: event.target.value });
  },

  render() {
    let countryNames = _.map(Countries, (country) => {
      return country.name;
    });

    return (
      <form>
        <h4 id="modalTitle">DOWNLOAD REPORT</h4>

        <hr />

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Start time</label>
          </div>

          <div className="large-7 columns">
            <DateTimePicker
              name="startPicker"
              date={this.state.startDate}
              dataPickerkey="startExportDatePicker"
              dataPickerRef="startExportDatePicker"
              dateOnClick={this._handleStartDateClick}
              dateOnChange={this.startDateOnChange}
              timeOnChange={this.startTimeOnChange}
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
              name="endPicker"
              date={this.state.endDate}
              dataPickerkey="endExportDatePicker"
              dataPickerRef="endExportDatePicker"
              dateOnClick={this._handleEndDateClick}
              dateOnChange={this.endDateOnChange}
              timeOnChange={this.endTimeOnChange}
              dateFormat="MM/DD/YYYY"
              timeFormat="h:mm a"
            />
          </div>
        </div>

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Type {this.props.netType}</label>
          </div>

          <div className="large-7 columns">
            <ul className="button-group round even-2 export-type-buttons">
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === 'ONNET' })}
                  onClick={this.toggleNetTypeOnnet}
                >Onnet</a>
              </li>
              <li>
                <a
                  className={classNames('button', { active: this.state.netType === 'OFFNET' })}
                  onClick={this.toggleNetTypeOffnet}
                >Offnet</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="row export-form-row-padding">
          <div className="large-5 columns">
            <label className="left bold">Destination</label>
          </div>


          <div className="large-7 columns">
            <select
              className="large export-destination radius"
              onChange={this.destinationChange}
              value={this.state.destination}
            >
              <option>Choose a destination</option>
              {Countries.map((country) => {
                return <option
                  key={country.countryCode}
                  value={country.alpha2}
                >{country.name}</option>
              })}
            </select>
          </div>
        </div>

        <hr />

        <div className="row text-center export-submit-buttons">
          <a
            role="button"
            href="#"
            className="button--secondary large"
            aria-label="Close"
            onClick={this.props.handleModalClose}
          >Cancel</a>

          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

          <a
            role="button"
            aria-label="submit form"
            href="#"
            className="button--primary large"
            onClick={this.proceedExport}
          >Proceed</a>
        </div>

      </form>
    )
  }
});

export default CDRExportForm;
