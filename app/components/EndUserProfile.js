import _ from 'lodash';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import classNames from 'classnames';

import AuthMixin from '../utils/AuthMixin';

import AuthStore from '../stores/AuthStore';
import EndUserStore from '../stores/EndUserStore';

import {fetchEndUser} from '../actions/fetchEndUsers';

import InfoPanel from './InfoPanel';
import Section from './InfoBlock';
import Item from './InfoItem';

var EndUserProfile = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [AuthMixin],

  statics: {
    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchEndUser, {
          carrierId: params.identity,
          username: params.username
        })
      ], done || function() {});
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.props.user = nextProps.user;
  },

  render: function() {
    return (
      <InfoPanel title={this.props.user.userDetails.displayName}>
        <Section title="Wallet Info">
          <Item label="Total"></Item>
          <Item label="Paid"></Item>
          <Item label="Free"></Item>
        </Section>
        <Section title="Account Info">
          <Item label="Created Time">{this.props.user.userDetails.creationDate}</Item>
          <Item label="Verified">{this.props.user.userDetails.verified}</Item>
          <Item label="Country">{this.props.user.userDetails.countryCode}</Item>
          <Item label="Mobile Number">{this.props.user.userDetails.username}</Item>
          <Item label="Email">{this.props.user.userDetails.email}</Item>
          <Item label="Pin">{this.props.user.userDetails.pin}</Item>
          <Item label="Date of Birth">{this.props.user.userDetails.birthDate}</Item>
          <Item label="Gender">{this.props.user.userDetails.gender}</Item>
        </Section>
        {this.props.user.userDetails.devices.map(function(d) {
          return (
            <Section title="App Info">
              <Item label="Device">{d.platform}</Item>
              <Item label="Version">{d.appVersionNumber}</Item>
              <Item label="Language">{d.appLanguage}</Item>
            </Section>
          )
        })}
      </InfoPanel>
    )
  }
});

export default EndUserProfile;
