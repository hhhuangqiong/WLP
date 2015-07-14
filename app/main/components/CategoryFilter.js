import React from 'react';
import classNames from 'classnames';

let CategoryFilter = React.createClass({
  propTypes: {
    category: React.PropTypes.string,
    handleVoiceFilterToggle: React.PropTypes.func,
    handleAnimationFilterToggle: React.PropTypes.func,
    handleStickerFilterToggle: React.PropTypes.func,
    handleFeaturedFilterToggle: React.PropTypes.func
  },

  render() {
    return (
      <ul className="button-group round">
        <li>
          <a className="button" onClick={this.props.handleVoiceFilterToggle}>
            <i className={classNames('icon-audio', 'vsf-type-filtering', {'icon-white': this.props.category === 'voice_sticker'})}></i>
          </a>
        </li>
        <li>
          <a className="button" onClick={this.props.handleAnimationFilterToggle}>
            <i className={classNames('icon-animation', 'vsf-type-filtering', {'icon-white': this.props.category === 'animation'})}></i>
          </a>
        </li>
        <li>
          <a className="button" onClick={this.props.handleStickerFilterToggle}>
            <i className={classNames('icon-sticker', 'vsf-type-filtering', {'icon-white': this.props.category === 'sticker'})}></i>
          </a>
        </li>
        <li>
          <a className="button" onClick={this.props.handleFeaturedFilterToggle}>
            <i className={classNames('icon-credit', 'vsf-type-filtering', {'icon-white': this.props.category === 'featured'})}></i>
          </a>
        </li>
      </ul>
    );
  }
});

export default CategoryFilter;
