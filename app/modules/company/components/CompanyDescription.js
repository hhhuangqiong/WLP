import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Select from 'react-select';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';

import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';

const MESSAGES = defineMessages({
  selectCountry: {
    id: 'company.selectCountry',
    defaultMessage: 'Select a country',
  },
  selectTimezone: {
    id: 'company.selectTimezone',
    defaultMessage: 'Select a timezone',
  },
});

const CompanyDescription = (props) => {
  const {
    companyName,
    country,
    timezone,
    countryOption,
    timezoneOption,
    onCountryChange,
    onCompanyNameChange,
    onTimezoneChange,
    disabled,
    validateField,
    errors,
    intl: { formatMessage },
   } = props;
  return (
    <div className="company-description company-content">
    <div className="row" defaultActiveKey = "2">
      <div className="large-10 columns">
        <label>
          <FormattedMessage id="companyName" defaultMessage="Company Name" />:
        </label>
      </div>
      <div className="large-14 columns">
        <input
          className={classNames('radius', { error: errors.companyName })}
          type="text"
          value={companyName}
          onChange={onCompanyNameChange}
          onBlur={validateField('companyName')}
          disabled={disabled}
        />
        <ValidationErrorLabel messages={errors.companyName} />
      </div>
    </div>
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="country" defaultMessage="Country" />:
          </label>
        </div>
        <div className="large-14 columns">
          <Select
            className={classNames({ error: errors.country })}
            name="select-country"
            value={country}
            placeholder={formatMessage(MESSAGES.selectCountry)}
            options={countryOption}
            onChange={onCountryChange}
            onBlur={validateField('country')}
            clearable={false}
            disabled={disabled}
          />
          <ValidationErrorLabel messages={errors.coutry} />
        </div>
      </div>
      <div className="row">
        <div className="large-10 columns">
          <label>
            <FormattedMessage id="timezone" defaultMessage="Timezone" />:
          </label>
        </div>
        <div className="large-14 columns">
          <Select
            className={classNames({ error: errors.timezone })}
            name="select-timezone"
            value={timezone}
            placeholder={formatMessage(MESSAGES.selectTimezone)}
            options={timezoneOption}
            onChange={onTimezoneChange}
            onBlur={validateField('timezone')}
            clearable={false}
            disabled={disabled}
          />
          <ValidationErrorLabel messages={errors.timezone} />
        </div>
      </div>
    </div>
  );
};

CompanyDescription.propTypes = {
  intl: intlShape.isRequired,
  companyName: PropTypes.string,
  country: PropTypes.string,
  timezone: PropTypes.string,
  countryOption: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  timezoneOption: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  disabled: PropTypes.bool.isRequired,
  onCountryChange: PropTypes.func,
  onCompanyNameChange: PropTypes.func,
  onTimezoneChange: PropTypes.func,
  validateField: PropTypes.func,
  errors: PropTypes.object,
};

export default injectIntl(CompanyDescription);
