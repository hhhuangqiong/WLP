import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('IM', () => {
  before(() => {
    browser.url(DEFAULT_URL);
    browser.signIn(ROOT_LOGIN.name, ROOT_LOGIN.password);
    browser.switchCompany('Maaii');
    browser.goTo('IM');
    browser.goToDetails();
  });

  it('should display data correctly', () => {
    browser.validateDateRange();
  });

  it('should display data correctly after changing date', () => {
    browser.changeDateRange();
    browser.validateDateRange();
  });

  it('should search sender correctly', () => {
    browser.selectByValue('.top-bar-section__query-select', 'sender');
    browser.validateSearch('.data-table__sender');
  });

  it('should search recipient correctly', () => {
    browser.selectByValue('.top-bar-section__query-select', 'recipient');
    browser.validateSearch('.data-table__recipient');
  });

  it('should clear search and show results', () => {
    browser.clearSearch();
  });

  it('should filter text data correctly', () => {
    browser.filterChatItem('text');
  });

  it('should filter image data correctly', () => {
    browser.filterChatItem('image');
  });

  it('should filter audio data correctly', () => {
    browser.filterChatItem('audio');
  });

  it('should filter video data correctly', () => {
    browser.filterChatItem('video');
  });

  it('should filter remote data correctly', () => {
    browser.filterChatItem('remote', 'sharing');
  });

  it('should filter animation data correctly', () => {
    browser.filterChatItem('animation');
  });

  it('should filter voice sticker data correctly', () => {
    browser.filterChatItem('voice_sticker', 'voice sticker');
  });

  it('should filter ephemeral image data correctly', () => {
    browser.filterChatItem('ephemeral_image', 'ephemeral image');
  });

  it('should filter with text and sender', () => {
    browser.filterChatItem('text');

    browser.selectByValue('.top-bar-section__query-select', 'sender');
    browser.validateSearch('.data-table__sender');
  });

  after(() => {
    browser.signOut();
  });
});
