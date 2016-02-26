import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class ColorRadioButton extends Component {
  clickRadio() {
    this.props.onChange(this.props.value);
  }

  renderLabel() {
    return (<label htmlFor={this.props.value}>{this.props.label}</label>);
  }

  renderButton() {
    return (
      <span className={
        classNames(
          this.props.color,
          'color-radio-button',
          { 'is-checked': this.props.checked }
        )}
      ></span>
    );
  }

  render() {
    if (!this.props.value) return null;

    return (
      <div className="color-radio-wrapper" onClick={this.clickRadio.bind(this)}>
        <input
          type="radio"
          id={this.props.value}
          name={this.props.group}
          checked={this.props.checked}
          className="hide"
        />

        <If condition={this.props.location === 'left'}>
          {this.renderButton()}
        </If>

        {this.renderLabel()}

        <If condition={this.props.location !== 'left'}>
          {this.renderButton()}
        </If>
      </div>
    );
  }
}

ColorRadioButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  group: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

ColorRadioButton.defaultProps = {
  color: 'black',
  location: 'left',
};
