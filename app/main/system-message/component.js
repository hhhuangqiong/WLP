import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Crouton from 'react-crouton';

const debug = require('debug')('app:main/system-message/component.js');

const SystemMessage = props => (
  <div className="system-message-container row">
    {
      !!props.message ?
        (
          <div className={classNames('system-message', props.type)}>
            <Crouton
              id={props.id}
              type={props.type}
              message={props.message}
              onDismiss={props.handleDismiss}
              buttons={props.buttons}
              hidden={props.hidden}
              timeout={props.timeout}
              autoDismiss={props.autoDismiss}
            />
          </div>
        ) : null
    }
  </div>
);

SystemMessage.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  type: PropTypes.oneOf(['error', 'info']),
  message: PropTypes.string,
  buttons: PropTypes.array,
  hidden: PropTypes.bool,
  timeout: PropTypes.number,
  autoDismiss: PropTypes.bool,
  handleDismiss: PropTypes.func.isRequired,
};

SystemMessage.defaultProps = {
  handleDismiss: () => {
    // eslint-disable-next-line max-len
    debug('Required prop `handleDismiss` was not specified. Used default function to prevent from error.');
  },
};

export default SystemMessage;
