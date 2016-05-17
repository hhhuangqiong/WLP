import React, { Component, PropTypes } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';

import ApplicationStore from '../../stores/ApplicationStore';
import { client as localeClient, util as localeUtil } from 'm800-user-locale';

const locales = require('../../../config').LOCALES;

class LanguageSwitcher extends Component {

  handleClick(e) {
    const lang = e.target.value;
    localeClient.set(lang);
  }

  render() {
    return (
      <div>
        <select className="language-switcher" defaultValue={this.props.currentLanguage} onChange={this.handleClick}>
          {locales.map(lang => <option key={lang} value={lang}>
            {localeUtil.getLangNativeName(lang)}
          </option>)}
        </select>
      </div>
    );
  }
}

LanguageSwitcher.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

LanguageSwitcher.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

LanguageSwitcher = connectToStores(LanguageSwitcher, [ApplicationStore], (context) => ({
  currentLanguage: context.getStore(ApplicationStore).getCurrentLanguage(),
}));

export default LanguageSwitcher;
