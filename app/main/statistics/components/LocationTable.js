import { get, map, sortBy, reduce, isUndefined } from 'lodash';
import React, { PropTypes } from 'react';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { countries } from 'country-data';
import CountryFlag from '../../../main/components/CountryFlag';

// TODO: makes column 1 & 2 sortable

const MESSAGES = defineMessages({
  locationTitle: {
    id: 'locationTable.title',
    defaultMessage: 'Location',
  },
  locationOthers: {
    id: 'locationTable.location.others',
    defaultMessage: 'Others',
  },
  locationEmpty: {
    id: 'locationTable.location.empty',
    defaultMessage: 'N/A',
  },
  locationLoading: {
    id: 'locationTable.location.loading',
    defaultMessage: '-',
  },
  valueEmpty: {
    id: 'locationTable.value.empty',
    defaultMessage: 'N/A',
  },
  valueLoading: {
    id: 'locationTable.value.loading',
    defaultMessage: '-',
  },
});

function parseListData(data, count) {
  const sortedData = sortBy(data, ({ value }) => -value);

  if (sortedData.length <= count) {
    return sortedData;
  }

  const breakdown = sortedData.slice(0, (count + 1));
  // eslint-disable-next-line no-return-assign,no-param-reassign
  const otherTotal = reduce(sortedData.slice(count), (result, { value }) => result += value, 0);

  breakdown.push({
    code: 'other',
    value: otherTotal,
  });

  return breakdown;
}

const LocationTable = props => {
  const { intl: { formatMessage } } = props;
  const { data, title: { location, unit }, count, isLoading } = props;
  const locationData = parseListData(data, count);

  return (
    <div className="geographic-chart__country-table">
      <div className="geographic-chart__country-table__header row">
        <div className="large-15 columns">
          { location || formatMessage(MESSAGES.locationTitle) }
        </div>
        <div className="large-9 columns">
          { unit }
        </div>
      </div>
      {
        !isLoading ? map(locationData, ({ code, value }) => {
          const _code = code && code.toUpperCase();
          const countryCode = get(countries, `${_code}.name`) || formatMessage(MESSAGES.locationOthers);

          return (
            <div className="geographic-chart__country-table__body row" key={code}>
              <div className="country large-15 columns">
                <CountryFlag code={code} />
                { countryCode || formatMessage(MESSAGES.locationEmpty) }
              </div>
              <div className="stats large-9 columns">
                { !isUndefined(value) && value.toLocaleString() || formatMessage(MESSAGES.valueEmpty) }
              </div>
            </div>
          );
        }) : (
          <div className="geographic-chart__country-table__body row" key="empty">
            <div className="country large-15 columns">{formatMessage(MESSAGES.locationLoading)}</div>
            <div className="stats large-9 columns">{formatMessage(MESSAGES.valueLoading)}</div>
          </div>
        )
      }
    </div>
  );
};

LocationTable.propTypes = {
  data: PropTypes.array,
  title: PropTypes.shape({
    location: PropTypes.string,
    unit: PropTypes.string,
  }),
  count: PropTypes.number,
  isLoading: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(LocationTable);
