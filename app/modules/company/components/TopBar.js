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
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      _id: null,
      status: null,
      hasError: true,
    };
  },

  _handleDeactivateCompany() {
    const { carrierId } = this
      .context
      .params;

    this.context.executeAction(deactivateCompany, { carrierId });
  },

  _handleReactivateCompany() {
    const { carrierId } = this
      .context
      .params;
    this.context.executeAction(reactivateCompany, { carrierId });
  },

  render() {
    const navParams = this
      .context
      .params;

    const identity = navParams.identity || null;
    const carrierId = navParams.carrierId || null;

    return (
      <FilterBar.Wrapper>
        <If condition={!this.props._id}>
          <FilterBar.NavigationItems>
            <Link
              to="company-create"
              params={{ identity }}
            >company profile</Link>
          </FilterBar.NavigationItems>
        <Else />
          <FilterBar.NavigationItems>
            <Link
              to={`/${identity}/companies/${carrierId}/profile`}
            >company profile</Link>
            <Link
              to={`/${identity}/companies/${carrierId}/service`}
            >service config</Link>
            <Link
              to={`/${identity}/companies/${carrierId}/widget`}
            >widget config</Link>
          </FilterBar.NavigationItems>
        </If>
        <If condition={this.props._id}>
          <FilterBar.LeftItems>
            <If condition={this.props.status === 'active'}>
              <CircleButton
                href={null}
                icon="icon-deactive"
                onClick={this._handleDeactivateCompany}
              />
            <Else />
              <CircleButton
                href={null}
                icon="icon-refresh"
                onClick={this._handleReactivateCompany}
              />
            </If>
          </FilterBar.LeftItems>
        </If>
        <FilterBar.RightItems>
          <button
            className={classNames(
              'company-action-bar__button',
              { disabled: this.props.hasError })
            }
            onClick={!this.props.hasError ? this.props.onSave : null}
          >save</button>
        </FilterBar.RightItems>
      </FilterBar.Wrapper>
    );
  },
});

export default CompanyTopBar;
