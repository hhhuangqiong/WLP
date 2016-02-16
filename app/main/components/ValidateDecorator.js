import React, { findDOMNode, Component } from 'react';

export function assertError(event, validation) {
  const target = event.target;

  if (!validation) return false;

  const result = validation.validate(target.value);

  if (!hasError(event)) return true;

  if (result.error) {
    appendError(target, result.error.message, `${target.name}Error`);
  } else {
    removeError(target, `${target.name}Error`);
  }

  return !!result.error;
}

export function appendError(input, errorMessage, errorId) {
  // Append error label
  const appendedErrorElement = document.getElementById(errorId);
  const errorLabel = document.createElement('label');

  errorLabel.id = errorId;
  errorLabel.innerHTML = errorMessage;
  if (!appendedErrorElement) findDOMNode(input).parentNode.appendChild(errorLabel);

  // Add error class
  if (input.className.indexOf('error') < 1) input.className += ' error';
}

export function removeError(input, errorId) {
  do {
    // Remove error label
    const appendedErrorElement = document.getElementById(errorId);
    if (appendedErrorElement) findDOMNode(input).parentNode.removeChild(appendedErrorElement);

    // Remove error class
    input.className = input.className.replace('error', '').trim();
  } while (document.getElementById(errorId));
}

export function hasError(event) {
  return event.target.className.indexOf('error') > 0;
}

function withValidator(validator = {}) {
  return function(ComposedComponent) {
    class ValidatorComponent extends Component {
      constructor() {
        super();
        this.state = { isError: false };
      }

      validateMatch = (key, targetName) => {
        const targetValue = this.state[targetName];
        const validationResult = { error: null, value: key };

        if (key !== targetValue) {
          validationResult['error'] = {
            message: `${targetName} do not match`
          };
        }

        return validationResult;
      }

      validate = (event) => {
        /* Prevent to run before DOMs are all attacted */
        if (!event) return;

        event.preventDefault();

        const target = event.target;
        const name = target.name;
        const value = target.value;
        const validation = validator[name];
        const result = (typeof validation === 'string') ? this.validateMatch(value, validation) : validation.validate(value);

        // Keep current input data for matching
        this.setState({ [name]: value });
        this.modifyErrorState(target, result);

        return result;
      }

      modifyErrorState = (input, result) => {
        const errorId = `${input.name}Error`;
        if (result.error) return this.setErrorState(input, result.error.message, errorId);
        this.removeErrorState(input, errorId);
      }

      setErrorState = (input, errorMessage, errorId) => {
        appendError(input, errorMessage, errorId);

        // Set error state
        this.setState({ [errorId]: errorMessage });
      }

      removeErrorState = (input, errorId) => {
        removeError(input, errorId);

        // Remove error state
        this.setState({ [errorId]: null });
      }

      isError = () => {
        for (const key in this.state) {
          if (key.indexOf('Error') > 0 && this.state[key]) return true;
        }

        return false;
      }

      render() {
        return <ComposedComponent {...this.props} isError={this.isError} validate={this.validate} />;
      }
    }

    return ValidatorComponent;
  };
}

export default withValidator;
