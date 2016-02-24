import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import deactivateCompany from '../actions/deactivateCompany';
import reactivateCompany from '../actions/reactivateCompany';

import * as FilterBar from '../../../main/components/FilterBar';
import { CircleButton } from '../../../main/components/Buttons';

const CompanyTopBar = React.createClass({
  propTypes: {
    _id: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive']),
    hasError: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
  },

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      _id: null,
      status: null,
      hasError: true,
    };
  },

  render() {
    const navParams = this.context.router.getCurrentParams();
    const role = navParams.role || null;
    const identity = navParams.identity || null;
    const carrierId = navParams.carrierId || null;

    return (
      <FilterBar.Wrapper>
        <If condition={!this.props._id}>
          <FilterBar.NavigationItems>
            <Link to="company-create" params={{ role: role, identity: identity }}>company profile</Link>
          </FilterBar.NavigationItems>
        <Else />
          <FilterBar.NavigationItems>
            <Link to="company-profile" params={{ role: role, identity: identity, carrierId: carrierId }}>company profile</Link>
            <Link to="company-service" params={{ role: role, identity: identity, carrierId: carrierId }}>service config</Link>
            <Link to="company-widget" params={{ role: role, identity: identity, carrierId: carrierId }}>widget config</Link>
          </FilterBar.NavigationItems>
        </If>
        <If condition={this.props._id}>
          <FilterBar.LeftItems>
            <If condition={this.props.status === 'active'}>
              <CircleButton href={null} icon="icon-deactive" onClick={this._handleDeactivateCompany} />
            <Else />
              <CircleButton href={null} icon="icon-refresh" onClick={this._handleReactivateCompany} />
            </If>
          </FilterBar.LeftItems>
        </If>
        <FilterBar.RightItems>
          <button className={classNames('company-action-bar__button', { disabled: this.props.hasError })} onClick={!this.props.hasError ? this.props.onSave : null}>save</button>
        </FilterBar.RightItems>
      </FilterBar.Wrapper>
    );
  },

  _handleDeactivateCompany() {
    const { carrierId } = this.context.router.getCurrentParams();
    this.context.executeAction(deactivateCompany, { carrierId });
  },

  _handleReactivateCompany() {
    const { carrierId } = this.context.router.getCurrentParams();
    this.context.executeAction(reactivateCompany, { carrierId });
  },
});

export default CompanyTopBar;
