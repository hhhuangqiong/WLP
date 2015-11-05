import _                  from 'lodash';
import classNames         from 'classnames';
import React              from 'react';
import FluxibleMixin      from 'fluxible/addons/FluxibleMixin';
import Crouton            from 'react-crouton';
import SystemMessageStore from '../../stores/SystemMessageStore';

var SystemMessage = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [SystemMessageStore]
  },

  getInitialState: function () {
    return { systemMessage: {} };
  },

  onChange: function() {
    // IMPORTANT
    // DO NOT remove these or you will have to take care of the css changes
    let message = this.getStore(SystemMessageStore).getState();
    let onDismiss = () => {
      setTimeout(() => {
        this.setState({ systemMessage: null });
      }, 0);
    };

    this.setState({
      systemMessage: _.merge(message, { onDismiss: onDismiss })
    });
  },

  render: function() {
    return (
      <div className="system-message-container row">
        {
          this.state.systemMessage && this.state.systemMessage.message ?
            (
              <div className={classNames('system-message', this.state.systemMessage.type)}>
                <Crouton
                  id={this.state.systemMessage.id}
                  type={this.state.systemMessage.type}
                  message={this.state.systemMessage.message}
                  onDismiss={this.state.systemMessage.onDismiss}
                  buttons={this.state.systemMessage.buttons}
                  hidden={this.state.systemMessage.hidden}
                  timeout={this.state.systemMessage.timeout}
                  autoMiss={this.state.systemMessage.autoMiss} />
              </div>
            ) : null
        }
      </div>
    );
  }
});

export default SystemMessage;
