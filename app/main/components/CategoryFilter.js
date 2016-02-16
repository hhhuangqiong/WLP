import React from 'react';
import classNames from 'classnames';

const CategoryFilter = React.createClass({
  propTypes: {
    category: React.PropTypes.string,
    handleVoiceFilterToggle: React.PropTypes.func,
    handleAnimationFilterToggle: React.PropTypes.func,
    handleStickerFilterToggle: React.PropTypes.func,
    handleCreditFilterToggle: React.PropTypes.func,
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
          <a className="button" onClick={this.props.handleCreditFilterToggle}>
            <i className={classNames('icon-credit', 'vsf-type-filtering', {'icon-white': this.props.category === 'credit'})}></i>
          </a>
        </li>
      </ul>
    );
  },
});

export default CategoryFilter;
