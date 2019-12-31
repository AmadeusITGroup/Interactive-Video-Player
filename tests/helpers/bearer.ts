import * as Utils from '../../src/scripts/utils';
const bearer = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcmlkIjoiNThkOGJiMDlmMTQ5YzUwMDAxMzJjNjZjIiwiZW52IjoiVEVTVCIsInNlc3Npb25pZCI6IjViZjNlNWJlMDUxNGYxMDAwMWIwN2U1YyJ9.niFu8fOEcYPFDegD9NFdjDEDYG5rAQSlfz7rzZUdwXI';

export function setBearer() {
  const authorizedStore = Utils.getAuthorizedStore();
  const key = Utils.getTravelCastKeyName(authorizedStore);
  Utils.setKey(authorizedStore, key, bearer, 1);
}