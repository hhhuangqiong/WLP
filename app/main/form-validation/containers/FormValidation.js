import { injectIntl } from 'react-intl';
import validation from 'react-validation-mixin';
import strategy from 'joi-validation-strategy';
import i18nValidationMessages from '../constants/i18nValidationMessages';

// A higher order function to transform Joi validation messages to i18n compatible format
// with wrapping both react-validation-mixin, joi-validation-strategy and injectIntl
// into a single wrapper for simplicity
export default function FormValidation(TargetComponent) {
  const composeValidation = validation(strategy(i18nValidationMessages));
  return injectIntl(composeValidation(TargetComponent));
}
