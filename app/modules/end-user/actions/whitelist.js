import { get } from 'lodash';

import {
  ADD_WHITELIST_USER,
  CHANGE_FILTER,
  CHANGE_NEW_WHITELIST_PAGE,
  CHANGE_NEW_WHITELIST_PAGE_REC,
  CLEAR_WHITELIST,
  CLEAR_NEW_WHITELIST,
  COMPLETE_IMPORT_FILE,
  FETCH_WHITELIST_START,
  FETCH_WHITELIST_SUCCESS,
  FETCH_WHITELIST_FAILURE,
  START_IMPORT_FILE,
  UPDATE_WHITELIST_USER,
  DELETE_WHITELIST_USER,
} from '../constants/actionTypes';

export function fetchWhitelist(context, payload, done) {
  const { apiClient } = context;
  const { carrierId, username, query } = payload;

  context.dispatch(FETCH_WHITELIST_START);

  let endpoint = `carriers/${carrierId}/users/whitelist`;

  if (username) {
    endpoint = `${endpoint}/${username}`;
  }

  apiClient
    .get(endpoint, { query })
    .then(result => {
      context.dispatch(FETCH_WHITELIST_SUCCESS, get(result, 'whitelist'));
      done();
    })
    .catch(err => {
      context.dispatch(FETCH_WHITELIST_FAILURE, err);
      done();
    });
}

export function clearWhitelist(context) {
  context.dispatch(CLEAR_WHITELIST);
}

export function changeFilter(context, payload) {
  context.dispatch(CHANGE_FILTER, payload);
}

export function changeNewWhitelistPage(context, toPage) {
  context.dispatch(CHANGE_NEW_WHITELIST_PAGE, toPage);
}

export function changeNewWhitelistPageRec(context, pageRec) {
  context.dispatch(CHANGE_NEW_WHITELIST_PAGE_REC, pageRec);
}

export function addWhitelistUser(context) {
  context.dispatch(ADD_WHITELIST_USER);
}

export function updateWhitelistUser(context, payload) {
  context.dispatch(UPDATE_WHITELIST_USER, payload);
}

export function deleteWhitelistUser(context, payload) {
  context.dispatch(DELETE_WHITELIST_USER, payload);
}

export function startImportFile(context, filename) {
  context.dispatch(START_IMPORT_FILE, filename);
}

export function completeImportFile(context, payload) {
  context.dispatch(COMPLETE_IMPORT_FILE, payload);
}

export function clearNewWhitelist(context) {
  context.dispatch(CLEAR_NEW_WHITELIST);
}

export function submitWhitelist(context) {
  context.dispatch(CLEAR_NEW_WHITELIST);
}
