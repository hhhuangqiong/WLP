import { isEmpty, bindAll } from 'lodash';
import cx from 'classnames';
import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Icon from '../../../../main/components/Icon';

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
      'handleUpdate',
      'handleDelete',
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

  handleUpdate() {
    const { index, handleValidation } = this.props;
    const { value } = this.textInput;

    const error = handleValidation ? handleValidation(value, index) : null;

    if (!!error) {
      this.textInput.focus();
    } else {
      this.handleExitEditing();
    }

    this.props.handleUpdate(index, { value, error });
  }

  handleDelete() {
    const { index, value } = this.props;
    this.props.handleDelete(index, value);
  }

  handleKeyPress(e) {
    if (e.which === 13) {
      this.handleUpdate();
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
    const { value, error, handleUpdate, handleDelete } = this.props;

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
              onClick={this.handleUpdate}
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
      <div>
        <span>{ value }</span>
        {
          displayControl && (
            <span className="editable-text__control">
              {handleUpdate ? (
                <span onClick={this.handleStartEditing}>
                  <Icon className="editable-text__icon" symbol="icon-menusetting" />
                </span>
              ) : null}
              {handleDelete ? (
                <span onClick={this.handleDelete}>
                  <Icon className="editable-text__icon" symbol="icon-delete" />
                </span>
              ) : null}
            </span>
          )
        }
      </div>
    );
  }

  render() {
    const { isEditing } = this.state;
    const { error, intl: { formatMessage } } = this.props;

    return (
      <div
        className={cx('row', 'editable-text', { 'editable-text--editing': isEditing })}
        onMouseEnter={this.displayControl}
        onMouseLeave={this.removeControl}
      >
        <div className="large-8 columns">
          {this.renderField()}
        </div>
        <div className="large-16 columns">
          {error && <span className="error-text right">{formatMessage(error)}</span>}
        </div>
      </div>
    );
  }
}

EditableText.propTypes = {
  intl: intlShape.isRequired,
  isEditing: PropTypes.bool,
  index: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.object,
  value: PropTypes.string,
  handleValidation: PropTypes.func,
  handleUpdate: PropTypes.func,
  handleDelete: PropTypes.func,
};

export default injectIntl(EditableText);
