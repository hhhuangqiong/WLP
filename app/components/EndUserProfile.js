import _ from 'lodash';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import classNames from 'classnames';

import EndUserStore from '../stores/EndUserStore';

import InfoPanel from './InfoPanel';
import Section from './InfoBlock';
import Item from './InfoItem';

var EndUserProfile = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [EndUserStore]
  },
  getInitialState: function () {
    return this.getStateFromStore();
  },
  getStateFromStore: function() {
    let user = this.getStore(EndUserStore).getState().currentUser
    if (user && user.userDetails) {
      return user.userDetails;
    }
    return {};
  },
  onChange: function() {
    this.setState(this.getStateFromStore());
  },
  render: function() {
    return (
      <InfoPanel title={this.state.displayName}>
        <Section title="Wallet Info">
          <Item label="Total"></Item>
          <Item label="Paid"></Item>
          <Item label="Free"></Item>
        </Section>
        <Section title="Account Info">
          <Item label="Created Time">{this.state.creationTime}</Item>
          <Item label="Verified">{this.state.verified}</Item>
          <Item label="Country">{this.state.countryCode}</Item>
          <Item label="Mobile Number">{this.state.username}</Item>
          <Item label="Email">{this.state.email}</Item>
          <Item label="Pin">{this.state.pin}</Item>
          <Item label="Date of Birth">{this.state.dob}</Item>
          <Item label="Gender">{this.state.gender}</Item>
        </Section>
        <Section title="App Info">
          <Item label="Device">{this.state.devices}</Item>
          <Item label="Version">test</Item>
          <Item label="Language">test</Item>
        </Section>
      </InfoPanel>
    )
  }
});

export default EndUserProfile;
