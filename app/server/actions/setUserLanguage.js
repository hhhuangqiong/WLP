import { util } from 'm800-user-locale';

module.exports = (context, { req }) => {
  context.dispatch('LANGUAGE_CHANGED', util.getSupportedLangCode(req.locale));
};
