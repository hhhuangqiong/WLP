import _ from 'lodash';
import moment from 'moment';
import dispatchApiCall from '../../../utils/dispatchApiCall';

export default async (context, params) => {
  const {
    from,
    to,
    quantity,
    timescale,
    carrierId,
  } = params;

  const timeRangeForCurrentPeriod = {
    from: moment(from).format(),
    to: moment(to).format(),
  };
  const paramsForCurrentPeriod = _.merge({
    timescale,
    application: params.application,
    carrierId: params.carrierId,
  }, timeRangeForCurrentPeriod);

  const timeRangeForPreviousPeriod = {
    from: moment(from).subtract(quantity, timescale).format(),
    to: moment(to).subtract(quantity, timescale).format(),
  };

  const paramsForLastPeriod = _.merge({}, paramsForCurrentPeriod, timeRangeForPreviousPeriod);

  const fetchedData = {};

  const getVerificationStatsByStatusCurrent = dispatchApiCall({
    context,
    eventPrefix: 'FETCH_VERIFICATION_ATTEMPTS',
    url: `/carriers/${carrierId}/verificationStats`,
    method: 'get',
    query: _.merge(paramsForCurrentPeriod, { type: 'success' }),
  });

  const getVerificationStatsByType = dispatchApiCall({
    context,
    eventPrefix: 'FETCH_VERIFICATION_TYPE',
    url: `/carriers/${carrierId}/verificationStats`,
    method: 'get',
    query: _.merge(paramsForCurrentPeriod, { type: 'type' }),
  });

  const getVerificationStatsByPlatform = dispatchApiCall({
    context,
    eventPrefix: 'FETCH_VERIFICATION_OS_TYPE',
    url: `/carriers/${carrierId}/verificationStats`,
    method: 'get',
    query: _.merge(paramsForCurrentPeriod, { type: 'platform' }),
  });

  const getVerificationStatsByCountry = dispatchApiCall({
    context,
    eventPrefix: 'FETCH_VERIFICATION_COUNTRIES_DATA',
    url: `/carriers/${carrierId}/verificationStats`,
    method: 'get',
    query: _.merge(paramsForCurrentPeriod, { type: 'country' }),
  });

  const getVerificationStatsByStatusPast = dispatchApiCall({
    context,
    eventPrefix: 'FETCH_VERIFICATION_PAST_ATTEMPTS',
    url: `/carriers/${carrierId}/verificationStats`,
    method: 'get',
    query: _.merge(paramsForLastPeriod, { type: 'success' }),
  });


  const [currentAttemptData, typeData, osData, countriesData, pastAttemptData] =
    await Promise.all([
      getVerificationStatsByStatusCurrent,
      getVerificationStatsByType,
      getVerificationStatsByPlatform,
      getVerificationStatsByCountry,
      getVerificationStatsByStatusPast,
    ]);

  fetchedData.currentAttemptData = currentAttemptData;
  fetchedData.typeData = typeData.data;
  fetchedData.osData = osData.data;
  fetchedData.countriesData = countriesData;
  fetchedData.pastAttemptData = pastAttemptData;

  context.dispatch('FETCH_VERIFICATION_OVERVIEW_SUCCESS', fetchedData);
};
