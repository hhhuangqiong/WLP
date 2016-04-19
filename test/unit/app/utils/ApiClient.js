import { expect } from 'chai';
import ApiClient, { formatUrl } from 'app/utils/ApiClient';

describe('ApiClient', () => {
  const apiProxy = '/api';
  const invalidUrl = null;
  const validUrl = 'http://127.0.0.1:3000';
  const validUrlWithSlashSuffix = 'http://127.0.0.1:3000/';
  const invalidPath = null;
  const validPath = '/session';
  const validPathWithoutSlashPrefix = 'session';
  const isClient = false;
  const isServer = true;

  describe('#formatUrl()', () => {
    it('should throw error if `url` argument is missing or is not a string', (done) => {
      const fn = () => { formatUrl(invalidUrl, validPath); };
      expect(fn).to.throw('invalid url parameter');
      done();
    });

    it('should throw error if `path` argument is missing or is not a string', (done) => {
      const fn = () => { formatUrl(validUrl, invalidPath); };
      expect(fn).to.throw('invalid path parameter');
      done();
    });

    it('should remove the last char of `/` from a valid url for server request', (done) => {
      const serverResult = formatUrl(validUrlWithSlashSuffix, validPath, isServer);
      expect(serverResult).to.equal(`${validUrl}${apiProxy}${validPath}`);
      done();
    });

    it('should add `/` prefix to a valid path if it is missing', (done) => {
      const clientResult = formatUrl(validUrl, validPathWithoutSlashPrefix, isClient);
      const serverResult = formatUrl(validUrl, validPathWithoutSlashPrefix, isServer);
      expect(clientResult).to.equal(`${apiProxy}/${validPathWithoutSlashPrefix}`);
      expect(serverResult).to.equal(`${validUrl}${apiProxy}/${validPathWithoutSlashPrefix}`);
      done();
    });

    it(`should proxy a valid path to ${apiProxy}`, (done) => {
      const clientResult = formatUrl(validUrl, validPath, isClient);
      const serverResult = formatUrl(validUrl, validPath, isServer);
      expect(clientResult).to.equal(`${apiProxy}${validPath}`);
      expect(serverResult).to.equal(`${validUrl}${apiProxy}${validPath}`);
      done();
    });

    it('should return a full url for a server request', (done) => {
      const serverResult = formatUrl(validUrl, validPath, isServer);
      expect(serverResult).to.equal(`${validUrl}${apiProxy}${validPath}`);
      done();
    });

    it('should return an absolute url for a client request', (done) => {
      const clientResult = formatUrl(validUrl, validPath, isClient);
      expect(clientResult).to.equal(`${apiProxy}${validPath}`);
      done();
    });
  });
});
