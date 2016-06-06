import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Icon from '../../../main/components/Icon';

const InfoBlock = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    hasIndicator: PropTypes.bool.isRequired,
    verified: PropTypes.bool.isRequired,
    children: PropTypes.element.isRequired,
  },

  getInitialState() {
    return {
      isCollapsed: false,
    };
  },

  _toggleIsCollapsed() {
    this.setState({
      isCollapsed: !this.state.isCollapsed,
    });
  },

  render() {
    return (
      <li className="accordion__item">
        <If condition={this.props.title}>
          <a className="accordion__item__head" onClick={this._toggleIsCollapsed}>
            <span>{this.props.title}</span>
            <If condition={this.props.hasIndicator}>
              <span className={classNames(
                'text-center',
                'accordion__item__head__indicator',
                { 'accordion__item__head__indicator--success': this.props.verified },
                { 'accordion__item__head__indicator--alert': !this.props.verified }
              )}
              >
                <If condition={this.props.verified}>
                  <Icon symbol="icon-tick" />
                <Else />
                  <Icon symbol="icon-error" />
                </If>
              </span>
            </If>
          </a>
        </If>
        <div className={classNames('accordion__item__body', { collapsed: this.state.isCollapsed })}>
          {this.props.children}
        </div>
      </li>
    );
  },
});

export default InfoBlock;
