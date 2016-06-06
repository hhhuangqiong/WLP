import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';

const CategoryFilter = React.createClass({
  propTypes: {
    category: React.PropTypes.string,
    handleVoiceFilterToggle: React.PropTypes.func,
    handleAnimationFilterToggle: React.PropTypes.func,
    handleStickerFilterToggle: React.PropTypes.func,
    handleCreditFilterToggle: React.PropTypes.func,
  },

  renderFilterItem(category, action, icon) {
    return (
      <li>
        <a className="button" onClick={action} >
          <Icon
            className={classNames(this.props.category,
              'vsf-type-filtering',
              { 'vsf-type-filtering--active': this.props.category === category }
            )}
            symbol={icon}
          />
        </a>
      </li>
    );
  },

  render() {
    return (
      <ul className="button-group round">
        {this.renderFilterItem('voice_sticker', this.props.handleVoiceFilterToggle, 'icon-audio')}
        {this.renderFilterItem('animation', this.props.handleAnimationFilterToggle, 'icon-animation')}
        {this.renderFilterItem('sticker', this.props.handleStickerFilterToggle, 'icon-sticker')}
        {this.renderFilterItem('credit', this.props.handleCreditFilterToggle, 'icon-credit')}
      </ul>
    );
  },
});

export default CategoryFilter;
