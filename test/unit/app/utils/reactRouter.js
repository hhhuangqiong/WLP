import { expect } from 'chai';
import { getRedirectPath } from 'app/utils/reactRouter';

describe('React-router util', () => {
  describe('#getRedirectPath()', () => {
    const pathName = '/home';
    const search = '';
    const noPathArgument = { search };
    const notStringArgument = { pathname: 1, search: undefined };
    const validArgument = { pathname: pathName, search };

    it('should throw error if the argument does not contain `pathname` key', (done) => {
      const fn = () => getRedirectPath(noPathArgument);
      expect(fn).to.throw(Error);
      done();
    });

    // eslint-disable-next-line max-len
    it('should throw error if the key `pathname` or `search` from argument is not a string', (done) => {
      const fn = () => getRedirectPath(notStringArgument);
      expect(fn).to.throw(Error);
      done();
    });

    it('should not throw error with valid argument', (done) => {
      const fn = () => getRedirectPath(validArgument);
      expect(fn).not.to.throw(Error);
      done();
    });

    it('should return a string with valid argument', (done) => {
      const path = getRedirectPath(validArgument);
      expect(path).to.be.a('string').that.equals(pathName);
      done();
    });
  });
});
