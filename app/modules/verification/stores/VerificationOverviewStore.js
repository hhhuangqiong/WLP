import {createStore} from 'fluxible/addons';

export default createStore({
  storeName: 'VerificationOverviewStore',

  handlers: {
    FETCH_VERIFICATION_COUNTRIES_DATA_SUCCESS: 'handleCountriesDataFetched',
    FETCH_VERIFICATION_COUNTRIES_DATA_FAILURE: 'handleCountriesDataFetchedFailure',
    FETCH_VERIFICATION_ATTEMPTS_SUCCESS: 'handleAttempsFetched',
    FETCH_VERIFICATION_ATTEMPTS_FAILURE: 'handleAttempsFetchedFailure',
    FETCH_VERIFICATION_PAST_ATTEMPTS_SUCCESS: 'handlePastAttemptsFetched',
    FETCH_VERIFICATION_PAST_ATTEMPTS_FAILURE: 'handlePastAttemptsFetchedFailure',
    FETCH_VERIFICATION_TYPE_SUCCESS: 'handleVerificationTypeFetched',
    FETCH_VERIFICATION_TYPE_FAILURE: 'handleVerificationTypeFetchedFailure',
    FETCH_VERIFICATION_OS_TYPE_SUCCESS: 'handleVerificationOsTypeFetched',
    FETCH_VERIFICATION_OS_TYPE_FAILURE: 'handleVerificationOsTypeFetchedFailure'
  },

  initialize () {
    this.countriesData = [];
    this.types = [];
    this.osTypes = [];

    this.accumulatedAttempts = 0;
    this.accumulatedFailure = 0;
    this.accumulatedSuccess = 0;
    this.averageSuccessRate = 0;

    this.pastAccumulatedAttempts = 0;
    this.pastAccumulatedFailure = 0;
    this.pastAccumulatedSuccess = 0;
    this.pastAverageSuccessRate = 0;

    this.successAttempts = [];
    this.successRates = [];
    this.totalAttempts = [];
  },

  handleCountriesDataFetched(payload) {
    this.countriesData = payload;

    this.emitChange();
  },

  handleCountriesDataFetchedFailure() {
    this.countriesData = [];

    this.emitChange();
  },

  handleAttempsFetched(payload) {
    this.accumulatedAttempts = payload.accumulatedAttempts;
    this.accumulatedFailure = payload.accumulatedFailure;
    this.accumulatedSuccess = payload.accumulatedSuccess;
    this.averageSuccessRate = payload.averageSuccessRate;

    this.successAttempts = payload.successAttempts;
    this.successRates = payload.successRates;
    this.totalAttempts = payload.totalAttempts;

    this.emitChange();
  },

  handleAttempsFetchedFailure() {
    this.accumulatedAttempts = 0;
    this.accumulatedFailure = 0;
    this.accumulatedSuccess = 0;
    this.averageSuccessRate = 0;

    this.successAttempts = null;
    this.successRates = null;
    this.totalAttempts = null;

    this.emitChange();
  },

  handlePastAttemptsFetched(payload) {
    this.pastAccumulatedAttempts = payload.accumulatedAttempts;
    this.pastAccumulatedFailure = payload.accumulatedFailure;
    this.pastAccumulatedSuccess = payload.accumulatedSuccess;
    this.pastAverageSuccessRate = payload.averageSuccessRate;

    this.emitChange();
  },

  handlePastAttemptsFetchedFailure() {
    // TODO: handle the failure together with the current attempts, or the calculation is incorrect
    this.pastAccumulatedAttempts = 0;
    this.pastAccumulatedFailure = 0;
    this.pastAccumulatedSuccess = 0;
    this.pastAverageSuccessRate = 0;

    this.emitChange();
  },

  handleVerificationTypeFetched(payload) {
    this.types = payload.data;
    this.emitChange();
  },

  handleVerificationTypeFetchedFailure() {
    this.types = null;
    this.emitChange();
  },

  handleVerificationOsTypeFetched(payload) {
    this.osTypes = payload.data;
    this.emitChange();
  },

  handleVerificationOsTypeFetchedFailure() {
    this.osTypes = null;
    this.emitChange();
  },

  getPastSummaryData() {
    return {
      pastAccumulatedAttempts: this.pastAccumulatedAttempts,
      pastAccumulatedFailure: this.pastAccumulatedFailure,
      pastAccumulatedSuccess: this.pastAccumulatedSuccess,
      pastAverageSuccessRate: this.pastAverageSuccessRate
    };
  },

  getOverviewData() {
    return {
      countriesData: this.countriesData,
      types: this.types,
      osTypes: this.osTypes,
      successAttempts: this.successAttempts,
      successRates: this.successRates,
      totalAttempts: this.totalAttempts,
      accumulatedAttempts: this.accumulatedAttempts,
      accumulatedFailure: this.accumulatedFailure,
      accumulatedSuccess: this.accumulatedSuccess,
      averageSuccessRate: this.averageSuccessRate,
      pastAccumulatedAttempts: this.pastAccumulatedAttempts,
      pastAccumulatedFailure: this.pastAccumulatedFailure,
      pastAccumulatedSuccess: this.pastAccumulatedSuccess,
      pastAverageSuccessRate: this.pastAverageSuccessRate
    };
  },

  dehydrate() {
    return {
      countriesData: this.countriesData,
      types: this.types,
      osTypes: this.osTypes,
      accumulatedAttempts: this.accumulatedAttempts,
      accumulatedFailure: this.accumulatedFailure,
      accumulatedSuccess: this.accumulatedSuccess,
      averageSuccessRate: this.averageSuccessRate,
      pastAccumulatedAttempts: this.pastAccumulatedAttempts,
      pastAccumulatedFailure: this.pastAccumulatedFailure,
      pastAccumulatedSuccess: this.pastAccumulatedSuccess,
      pastAverageSuccessRate: this.pastAverageSuccessRate,
      successAttempts: this.successAttempts,
      successRates: this.successRates,
      totalAttempts: this.totalAttempts
    };
  },

  rehydrate(state) {
    this.countriesData = state.countriesData;
    this.types = state.types;
    this.osTypes = state.osTypes;

    this.accumulatedAttempts = state.accumulatedAttempts
    this.accumulatedFailure = state.accumulatedFailure;
    this.accumulatedSuccess = state.accumulatedSuccess;
    this.averageSuccessRate = state.averageSuccessRate;

    this.pastAccumulatedAttempts = state.pastAccumulatedAttempts
    this.pastAccumulatedFailure = state.pastAccumulatedFailure;
    this.pastAccumulatedSuccess = state.pastAccumulatedSuccess;
    this.pastAverageSuccessRate = state.pastAverageSuccessRate;

    this.successAttempts = state.successAttempts;
    this.successRates = state.successRates;
    this.totalAttempts = state.totalAttempts;
  }
});
