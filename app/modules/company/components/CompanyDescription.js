import React, { PropTypes } from 'react';
import Select from 'react-select';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';

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
    country,
    timezone,
    contactDetail,
    countryOption,
    timezoneOption,
    onCountryChange,
    onTimezoneChange,
    onContactDetailChange,
    intl: { formatMessage },
   } = props;
  return (
    <div>
      <div className="company-description">
        <span className="inline header__sub">
          <FormattedMessage id="country" defaultMessage="Country" />:
        </span>
        <Select
          name="select-country"
          value={country}
          placeholder={formatMessage(MESSAGES.selectCountry)}
          options={countryOption}
          onChange={onCountryChange}
        />
      </div>
      <div className="company-description">
        <span className="inline header__sub">
          <FormattedMessage id="timezone" defaultMessage="Timezone" />:
        </span>
        <Select
          name="select-timezone"
          value={timezone}
          placeholder={formatMessage(MESSAGES.selectTimezone)}
          options={timezoneOption}
          onChange={onTimezoneChange}
        />
      </div>
      <div className="company-description " defaultActiveKey = "2">
        <span className="inline header__sub">
          <FormattedMessage id="contactDetail" defaultMessage="Contact Detail" />:
        </span>
        <input
          className="input-name"
          value={contactDetail}
          type="text"
          onChange={onContactDetailChange}
        />
      </div>
    </div>
  );
};

CompanyDescription.propTypes = {
  intl: intlShape.isRequired,
  country: PropTypes.string,
  timezone: PropTypes.string,
  contactDetail: PropTypes.string,
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
  onCountryChange: PropTypes.func,
  onTimezoneChange: PropTypes.func,
  onContactDetailChange: PropTypes.func,
};

export default injectIntl(CompanyDescription);
