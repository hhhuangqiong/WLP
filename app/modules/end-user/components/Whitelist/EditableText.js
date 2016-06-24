import { isEmpty } from 'lodash';
import cx from 'classnames';
import React, { Component, PropTypes } from 'react';

class EditableText extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: isEmpty(props.value) || props.error,
    };

    this.handleStartEditing = this.handleStartEditing.bind(this);
    this.handleExitEditing = this.handleExitEditing.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleTextUpdate = this.handleTextUpdate.bind(this);
  }

  componentDidMount() {
    if (this.state.isEditing) {
      this.textInput.focus();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { index: prevIndex, value: prevValue, error: prevError } = this.props;
    const { index: currentIndex, value: currentValue, error: currentError } = nextProps;
    const { isEditing: prevIsEditing } = this.state;
    const { isEditing: currentIsEditing } = nextState;

    return prevIndex !== currentIndex ||
        prevValue !== currentValue ||
        prevError !== currentError ||
        prevIsEditing !== currentIsEditing;
  }

  handleTextUpdate() {
    const { index } = this.props;
    const { value } = this.textInput;

    const error = this.props.handleTextValidation(value);

    if (!!error) {
      this.textInput.focus();
    } else {
      this.handleExitEditing();
    }

    this.props.handleTextUpdate(index, { value, error });
  }

  handleKeyPress(e) {
    if (e.which === 13) {
      this.handleTextUpdate();
    }
  }

  handleStartEditing() {
    this.setState({
      isEditing: true,
    });
  }

  handleExitEditing() {
    this.setState({
      isEditing: false,
    });
  }

  render() {
    const { isEditing } = this.state;
    const { value, error } = this.props;

    return (
      <div className={cx('editable-text', { 'editable-text--editing': isEditing })}>
        {
          isEditing ? (
            <div className="row">
              <div className="large-4 columns">
                <input
                  ref={c => { this.textInput = c; }}
                  className={cx({ error: !!error })}
                  type="text"
                  defaultValue={value}
                  onKeyPress={this.handleKeyPress}
                />
              </div>
              <div className="large-4 columns">
                <button
                  className="button--no-background button--extended radius"
                  onClick={this.handleTextUpdate}
                >OK</button>
                {
                  // TODO: add EDIT & DELETE controls
                }
              </div>
              <div className="large-16 columns">
                {
                  error ? (
                    <span className="error-text right">{ error.message }</span>
                  ) : null
                }
              </div>
            </div>
          ) : (
            <span>+{ value }</span>
          )
        }
      </div>
    );
  }
}

EditableText.propTypes = {
  isEditing: PropTypes.bool,
  index: PropTypes.string,
  error: PropTypes.object,
  value: PropTypes.string,
  handleTextValidation: PropTypes.func,
  handleTextUpdate: PropTypes.func,
};

export default EditableText;
