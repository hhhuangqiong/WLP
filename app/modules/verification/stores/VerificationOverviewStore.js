import _ from 'lodash';
import { createStore } from 'fluxible/addons';

export default createStore({
  storeName: 'VerificationOverviewStore',

  handlers: {
    FETCH_VERIFICATION_OVERVIEW_SUCCESS: 'handleOverviewDataFetched',
    FETCH_VERIFICATION_OVERVIEW_FAILURE: 'handleOverviewDataFetchedFailure',
    FETCH_VERIFICATION_ATTEMPTS_FAILURE: 'handleAttempsFetchedFailure',
    FETCH_VERIFICATION_TYPE_FAILURE: 'handleVerificationTypeFetchedFailure',
    FETCH_VERIFICATION_OS_TYPE_FAILURE: 'handleVerificationOsTypeFetchedFailure',
    FETCH_VERIFICATION_COUNTRIES_DATA_FAILURE: 'handleCountriesDataFetchedFailure',
    FETCH_VERIFICATION_PAST_ATTEMPTS_FAILURE: 'handlePastAttemptsFetchedFailure',
    CHANGE_TIME_RANGE: 'handleTimeRangeChange',
    RESET_VERIFICATION_DATA: 'reset',
  },

  reset() {
    this.initialize();
    this.emitChange();
  },

  initialize() {
    this.countriesData = null;
    this.types = null;
    this.osTypes = null;

    this.accumulatedAttempts = null;
    this.accumulatedFailure = null;
    this.accumulatedSuccess = null;
    this.averageSuccessRate = null;

    this.pastAccumulatedAttempts = null;
    this.pastAccumulatedFailure = null;
    this.pastAccumulatedSuccess = null;
    this.pastAverageSuccessRate = null;

    this.successAttempts = null;
    this.successRates = null;
    this.totalAttempts = null;

    this.countriesError = null;
    this.typeError = null;
    this.osError = null;
    this.attemptsError = null;
    this.pastAttemptsError = null;
  },

  handleOverviewDataFetched(payload) {
    this.countriesData = payload.countriesData;
    this.countriesError = null;

    this.types = payload.typeData;
    this.typeError = null;

    this.osTypes = payload.osData;
    this.osError = null;

    this.accumulatedAttempts = payload.currentAttemptData.accumulatedAttempts;
    this.accumulatedFailure = payload.currentAttemptData.accumulatedFailure;
    this.accumulatedSuccess = payload.currentAttemptData.accumulatedSuccess;
    this.averageSuccessRate = payload.currentAttemptData.averageSuccessRate;
    this.successAttempts = payload.currentAttemptData.successAttempts;
    this.successRates = payload.currentAttemptData.successRates;
    this.totalAttempts = payload.currentAttemptData.totalAttempts;
    this.attemptsError = null;

    this.pastAccumulatedAttempts = payload.pastAttemptData.accumulatedAttempts;
    this.pastAccumulatedFailure = payload.pastAttemptData.accumulatedFailure;
    this.pastAccumulatedSuccess = payload.pastAttemptData.accumulatedSuccess;
    this.pastAverageSuccessRate = payload.pastAttemptData.averageSuccessRate;
    this.pastAttemptsError = null;

    this.emitChange();
  },

  handleCountriesDataFetchedFailure(err) {
    this.countriesData = [];
    this.countriesError = err;

    this.emitChange();
  },

  handleAttempsFetchedFailure(err) {
    this.accumulatedAttempts = 0;
    this.accumulatedFailure = 0;
    this.accumulatedSuccess = 0;
    this.averageSuccessRate = 0;

    this.successAttempts = null;
    this.successRates = null;
    this.totalAttempts = null;

    this.attemptsError = err;

    this.emitChange();
  },

  handlePastAttemptsFetchedFailure(err) {
    this.pastAccumulatedAttempts = 0;
    this.pastAccumulatedFailure = 0;
    this.pastAccumulatedSuccess = 0;
    this.pastAverageSuccessRate = 0;

    this.pastAttemptsError = err;

    this.emitChange();
  },

  handleVerificationTypeFetchedFailure(err) {
    this.types = null;
    this.typeError = err;

    this.emitChange();
  },

  handleVerificationOsTypeFetchedFailure(err) {
    this.osTypes = null;
    this.osError = err;

    this.emitChange();
  },

  handleTimeRangeChange(timeRange) {
    this.timeRange = timeRange;
    this.successAttempts = null;
    this.successRates = null;
    this.totalAttempts = null;

    this.emitChange();
  },

  getTimeRange() {
    return this.timeRange;
  },

  getOverviewData() {
    return _.merge(
      this.getSummaryAttempts(),
      this.getCountryAttempts(),
      this.getSuccessFailAttempts(),
      this.getOsAttempts(),
      this.getMethodAttempts()
    );
  },

  getSummaryAttempts() {
    return {
      attemptsError: this.attemptsError,
      accumulatedAttempts: this.accumulatedAttempts,
      accumulatedFailure: this.accumulatedFailure,
      accumulatedSuccess: this.accumulatedSuccess,
      averageSuccessRate: this.averageSuccessRate,
      pastAccumulatedAttempts: this.pastAccumulatedAttempts,
      pastAccumulatedFailure: this.pastAccumulatedFailure,
      pastAccumulatedSuccess: this.pastAccumulatedSuccess,
      pastAverageSuccessRate: this.pastAverageSuccessRate,
      pastAttemptsError: this.pastAttemptsError,
    };
  },

  getCountryAttempts() {
    return {
      countriesError: this.countriesError,
      countriesData: this.countriesData,
    };
  },

  getSuccessFailAttempts() {
    return {
      attemptsError: this.attemptsError,
      successAttempts: this.successAttempts,
      successRates: this.successRates,
      totalAttempts: this.totalAttempts,
    };
  },

  getOsAttempts() {
    return {
      osError: this.osError,
      osTypes: this.osTypes,
    };
  },

  getMethodAttempts() {
    return {
      typeError: this.typeError,
      types: this.types,
    };
  },

  dehydrate() {
    return this.getOverviewData();
  },

  rehydrate(state) {
    this.countriesData = state.countriesData;
    this.types = state.types;
    this.osTypes = state.osTypes;

    this.accumulatedAttempts = state.accumulatedAttempts;
    this.accumulatedFailure = state.accumulatedFailure;
    this.accumulatedSuccess = state.accumulatedSuccess;
    this.averageSuccessRate = state.averageSuccessRate;

    this.pastAccumulatedAttempts = state.pastAccumulatedAttempts;
    this.pastAccumulatedFailure = state.pastAccumulatedFailure;
    this.pastAccumulatedSuccess = state.pastAccumulatedSuccess;
    this.pastAverageSuccessRate = state.pastAverageSuccessRate;

    this.successAttempts = state.successAttempts;
    this.successRates = state.successRates;
    this.totalAttempts = state.totalAttempts;

    this.countriesError = countriesError;
    this.attemptsError = attemptsError;
    this.pastAttemptsError = pastAttemptsError;
    this.typeError = typeError;
    this.osError = osError;
  },
});
