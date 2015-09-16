import {createStore} from 'fluxible/addons';

export default createStore({
  storeName: 'VerificationOverviewStore',

  handlers: {
    FETCH_VERIFICATION_COUNTRIES_DATA_SUCCESS: 'handleCountriesDataFetched',
    FETCH_VERIFICATION_ATTEMPTS_SUCCESS: 'handleAttempsFetched',
    FETCH_VERIFICATION_PAST_ATTEMPTS_SUCCESS: 'handlePastAttemptsFetched',
    FETCH_VERIFICATION_TYPE_SUCCESS: 'handleVerificationTypeFetched',
    FETCH_VERIFICATION_OS_TYPE_SUCCESS: 'handleVerificationOsTypeFetched'
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

  handlePastAttemptsFetched(payload) {
    this.pastAccumulatedAttempts = payload.pastAccumulatedAttempts;
    this.pastAccumulatedFailure = payload.pastAccumulatedFailure;
    this.pastAccumulatedSuccess = payload.pastAccumulatedSuccess;
    this.pastAverageSuccessRate = payload.pastAverageSuccessRate;

    this.emitChange();
  },

  handleVerificationTypeFetched(payload) {
    this.types = payload.data;
    this.emitChange();
  },

  handleVerificationOsTypeFetched(payload) {
    this.osTypes = payload.data;
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
