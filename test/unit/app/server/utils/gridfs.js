import sinon from 'sinon';
import { expect } from 'chai';

// object under test
import handler from 'app/server/utils/gridfs';

describe('gridFS util', function() {
  let filePath = 'public/images/logo-m800.png';

  describe('#getGridFS', () =>
    it('should throw error without mongoose connection', () =>
      handler.getGridFS(function(err, result) {
        expect(err)
          .to.be.an.Object;
        return expect(err.message)
          .to.equals('missing db argument\nnew Grid(db, mongo)');
      })
    )
  );

  describe('#addFile', function() {
    beforeEach(function() {
      return sinon.stub(handler, "getGridFS", () => ({}));
    });

    it('should throw error without specifying file path', () =>
      handler.addFile('', {}, function(err, doc) {
        expect(err)
          .to.be.an.Object;
        expect(err.message)
          .to.equals('missing file path');
      })
    );
  });
});
