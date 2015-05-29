import React   from 'react';
import Spinner from 'react-loader';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import LoadingSpinnerStore from '../../stores/LoadingSpinnerStore';
import classNames from 'classnames';

var LoadingSpinner = React.createClass({
  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [LoadingSpinnerStore]
  },

  getStateFromStore: function() {
    return {
      loaded: this.getStore(LoadingSpinnerStore).getLoaded(),
      options: this.getStore(LoadingSpinnerStore).getOptions()
    };
  },

  getInitialState: function() {
    return {
      loaded: true,
      options: this.getStore(LoadingSpinnerStore).getOptions()
    };
  },

  onChange: function() {
    this.setState(this.getStateFromStore());
  },

  render: function() {
    return (
      !this.state.loaded ? (
      <div className="loading-spinner-container row">
        <div className="loading-spinner">
          <Spinner loaded={this.state.loaded} options={this.state.options} />
        </div>
        <div className={classNames('loading-spinner__overlay', { hide: this.state.loaded })} />
      </div>
      ) : null
    )
  }
});

export default LoadingSpinner;
