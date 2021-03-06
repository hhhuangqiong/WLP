import {
  ADD_WHITELIST_USER,
  CHANGE_FILTER,
  CHANGE_NEW_WHITELIST_PAGE,
  CHANGE_NEW_WHITELIST_PAGE_REC,
  CLEAR_WHITELIST,
  CLEAR_NEW_WHITELIST,
  COMPLETE_IMPORT_FILE,
  START_IMPORT_FILE,
  UPDATE_WHITELIST_USER,
  DELETE_WHITELIST_USER,
} from '../constants/actionTypes';


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
