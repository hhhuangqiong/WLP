import { isPlainObject } from 'lodash';
import React, { PropTypes, Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { connectToStores } from 'fluxible-addons-react';
import SystemMessageStore from './store';
import SystemMessage from './component';
import dismissMessage from './actions/dismiss';

class SystemMessageContainer extends Component {
  constructor(props) {
    super(props);

    this.handleDismiss = this.handleDismiss.bind(this);
    this.parseMessage = this.parseMessage.bind(this);
  }

  handleDismiss() {
    this.context.executeAction(dismissMessage);
  }

  parseMessage(message) {
    const { formatMessage } = this.props.intl;

    if (isPlainObject(message)) {
      return formatMessage(message);
    }

    return message;
  }

  render() {
    const { message, ...restProps } = this.props;
    const formattedMessage = this.parseMessage(message);

    return (
      <SystemMessage
        {...restProps}
        message={formattedMessage}
        handleDismiss={this.handleDismiss}
      />
    );
  }
}

SystemMessageContainer.contextTypes = {
  executeAction: PropTypes.func,
};

SystemMessageContainer.propTypes = {
  intl: intlShape.isRequired,
  id: PropTypes.string,
  type: PropTypes.oneOf(['error', 'info']),
  message: PropTypes.string,
  buttons: PropTypes.array,
  hidden: PropTypes.bool,
  timeout: PropTypes.number,
  autoDismiss: PropTypes.bool,
  handleDismiss: PropTypes.func.isRequired,
};

SystemMessageContainer = connectToStores(
  SystemMessageContainer,
  [SystemMessageStore],
  context => ({ ...(context.getStore(SystemMessageStore).getState()) })
);

export default injectIntl(SystemMessageContainer);
