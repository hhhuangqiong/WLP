import { expect } from 'chai';

import {
  DEFAULT_URL,
  ROOT_LOGIN,
} from '../../lib/constants';

describe('IM', () => {
  describe('#basic', () => {
    before(done => {
      browser
        .url(DEFAULT_URL)
        .signIn(ROOT_LOGIN.name, ROOT_LOGIN.password)
        .switchCompany('Maaii')
        .goTo('IM')
        .goToDetails()
        .call(done);
    });

    after(done => {
      browser.signOut().call(done);
    });

    it('should display data correctly', done => {
      browser.validateDate().call(done);
    });

    it('should display data correctly after changing date', done => {
      browser.changeAndValidateDate().call(done);
    });

    it('should search sender correctly', done => {
      browser.searchAndValidate('.sender', 'sender').call(done);
    });

    it('should search recipient correctly', done => {
      browser.searchAndValidate('.recipient', 'recipient').call(done);
    });

    it('should clear search and show results', done => {
      browser
        .clearSearch()
        .getText('.im-table--row')
        .then(result => {
          if (typeof result === 'string') {
            expect(result).to.not.be.empty;
            return;
          }

          expect(result).to.have.length.above(0);
        })
        .call(done);
    });

    it('should filter text data correctly', done => {
      browser.filterChatItem('text').call(done);
    });

    it('should filter image data correctly', done => {
      browser.filterChatItem('image').call(done);
    });

    it('should filter audio data correctly', done => {
      browser.filterChatItem('audio').call(done);
    });

    it('should filter video data correctly', done => {
      browser.filterChatItem('video').call(done);
    });

    it('should filter remote data correctly', done => {
      browser.filterChatItem('remote', 'sharing').call(done);
    });

    it('should filter animation data correctly', done => {
      browser.filterChatItem('animation').call(done);
    });

    it('should filter voice sticker data correctly', done => {
      browser.filterChatItem('voice_sticker', 'voice sticker').call(done);
    });

    it('should filter ephemeral image data correctly', done => {
      browser.filterChatItem('ephemeral_image', 'ephemeral image').call(done);
    });

    it('should filter with text and sender', done => {
      browser
        .filterChatItem('text')
        .searchAndValidate('.sender', 'sender')
        .call(done);
    });

    it('should be able to export data', done => {
      browser.exportCsv().call(done);
    });
  });
});
