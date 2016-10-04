import { bindAll } from 'lodash';
import cx from 'classnames';
import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Icon from '../../../../main/components/Icon';

class EditableText extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
    const { editIndex, index } = this.props;
    if (editIndex === index) {
      this.textInput.focus();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { index: prevIndex, value: prevValue, error: prevError, editIndex: prevEditIndex } = this.props;
    const { index: currentIndex, value: currentValue, error: currentError, editIndex: currentEditIndex } = nextProps;
    const { displayControl: prevDisplayControl } = this.state;
    const { displayControl: currentDisplayControl } = nextState;

    return prevIndex !== currentIndex ||
        prevValue !== currentValue ||
        prevError !== currentError ||
        prevEditIndex !== currentEditIndex ||
        prevDisplayControl !== currentDisplayControl;
  }

  componentDidUpdate(prevProps) {
    // focus when the edit index changed
    if (prevProps.editIndex !== this.props.editIndex && this.props.editIndex === this.props.index) {
      this.textInput.focus();
    }
  }

  handleUpdate() {
    const { index, error } = this.props;
    const { value } = this.textInput;

    this.handleExitEditing();
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
    const { index } = this.props;
    this.props.handleStartEditing(index);
  }

  handleExitEditing() {
    const { index } = this.props;
    this.props.handleExitEditing(index);
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
    const { displayControl } = this.state;
    const { value, error, handleUpdate, handleDelete, editIndex, index } = this.props;

    // editing
    if (editIndex === index) {
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
    const { error, intl: { formatMessage }, index, editIndex } = this.props;

    return (
      <div
        className={cx('row', 'editable-text', { 'editable-text--editing': index === editIndex })}
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
  index: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  editIndex: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  error: PropTypes.object,
  value: PropTypes.string,
  handleUpdate: PropTypes.func,
  handleDelete: PropTypes.func,
  handleExitEditing: PropTypes.func,
  handleStartEditing: PropTypes.func,
};

export default injectIntl(EditableText);
