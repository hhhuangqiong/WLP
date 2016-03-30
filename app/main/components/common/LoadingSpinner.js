import React from 'react';
import Spinner from 'react-loader';
import classNames from 'classnames';
import { FluxibleMixin } from 'fluxible-addons-react';

import LoadingSpinnerStore from '../../stores/LoadingSpinnerStore';

const LoadingSpinner = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [LoadingSpinnerStore],
  },

  getInitialState() {
    return {
      loaded: true,
      options: this.getStore(LoadingSpinnerStore).getOptions(),
    };
  },

  onChange() {
    this.setState(this.getStateFromStore());
  },

  getStateFromStore() {
    return {
      loaded: this.getStore(LoadingSpinnerStore).getLoaded(),
      options: this.getStore(LoadingSpinnerStore).getOptions(),
    };
  },

  render() {
    return (
      !this.state.loaded ? (
      <div className="loading-spinner-container row">
        <div className="loading-spinner">
          <Spinner loaded={this.state.loaded} options={this.state.options} />
        </div>
        <div className={classNames('loading-spinner__overlay', { hide: this.state.loaded })} />
      </div>
      ) : null
    );
  },
});

export default LoadingSpinner;
