import { isEmpty, bindAll } from 'lodash';
import cx from 'classnames';
import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import Icon from '../../../../main/components/Icon';

const MESSAGES = defineMessages({
  deleteText: {
    id: 'message.deleteText',
    defaultMessage: 'Are you sure to delete {value}?',
  },
});

class EditableText extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: isEmpty(props.value),
      displayControl: false,
    };

    bindAll(this, [
      'handleStartEditing',
      'handleExitEditing',
      'handleKeyPress',
      'handleTextUpdate',
      'handleTextDelete',
      'displayControl',
      'removeControl',
    ]);
  }

  componentDidMount() {
    if (this.state.isEditing) {
      this.textInput.focus();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { index: prevIndex, value: prevValue, error: prevError } = this.props;
    const { index: currentIndex, value: currentValue, error: currentError } = nextProps;
    const { isEditing: prevIsEditing, displayControl: prevDisplayControl } = this.state;
    const { isEditing: currentIsEditing, displayControl: currentDisplayControl } = nextState;

    return prevIndex !== currentIndex ||
        prevValue !== currentValue ||
        prevError !== currentError ||
        prevIsEditing !== currentIsEditing ||
        prevDisplayControl !== currentDisplayControl;
  }

  handleTextUpdate() {
    const { index, value: originalValue } = this.props;
    const { value } = this.textInput;

    if (originalValue === value) {
      this.handleExitEditing();
      return;
    }

    const error = this.props.handleTextValidation(value);

    if (!!error) {
      this.textInput.focus();
    } else {
      this.handleExitEditing();
    }

    this.props.handleTextUpdate(index, { value, error });
  }

  handleTextDelete() {
    const { value, intl } = this.props;
    const { formatMessage } = intl;

    if (!confirm(formatMessage(MESSAGES.deleteText, { value }))) {
      return;
    }

    this.props.handleTextDelete(this.props.index);
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

  displayControl() {
    this.setState({
      displayControl: true,
    });
  }

  removeControl() {
    this.setState({
      displayControl: false,
    });
  }

  renderField() {
    const { isEditing, displayControl } = this.state;
    const { value, error } = this.props;

    if (isEditing) {
      return (
        <div className="row">
          <div className="large-12 columns">
            <input
              ref={c => { this.textInput = c; }}
              className={cx({ error: !!error })}
              type="text"
              defaultValue={value}
              onKeyPress={this.handleKeyPress}
            />
          </div>
          <div className="large-12 columns">
            <button
              className="button--no-background button--extended radius"
              onClick={this.handleTextUpdate}
            >
              <FormattedMessage
                id="ok"
                defaultMessage="OK"
              />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        onMouseEnter={this.displayControl}
        onMouseLeave={this.removeControl}
      >
        <span>+{ value }</span>
        {
          displayControl && (
            <span className="editable-text__control">
              <span onClick={this.handleStartEditing}>
                <Icon className="editable-text__icon" symbol="icon-menusetting" />
              </span>
              <span onClick={this.handleTextDelete}>
                <Icon className="editable-text__icon" symbol="icon-delete" />
              </span>
            </span>
          )
        }
      </div>
    );
  }

  render() {
    const { isEditing } = this.state;
    const { error } = this.props;

    return (
      <div className={cx('row', 'editable-text', { 'editable-text--editing': isEditing })}>
        <div className="large-8 columns">
          {this.renderField()}
        </div>
        <div className="large-16 columns">
          {error && <span className="error-text right">{ error.message }</span>}
        </div>
      </div>
    );
  }
}

EditableText.propTypes = {
  intl: intlShape.isRequired,
  isEditing: PropTypes.bool,
  index: PropTypes.string,
  error: PropTypes.object,
  value: PropTypes.string,
  handleTextValidation: PropTypes.func,
  handleTextUpdate: PropTypes.func,
  handleTextDelete: PropTypes.func,
};

export default injectIntl(EditableText);
