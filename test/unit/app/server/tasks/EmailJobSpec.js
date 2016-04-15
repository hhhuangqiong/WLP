import { expect } from 'chai';
import sinon from 'sinon';
import Queue from 'kue';
import Email from 'app/collections/email';

// object under test
import { JOB_TYPE, EmailJob } from 'app/server/tasks/EmailJob';

describe('Email Job', function() {

  describe('constructor', () =>

    it('should throw error on invalid parameter', function() {
      expect(() => new EmailJob())
      .to.throw(/queue/i);

      expect(function() {
        new EmailJob( sinon.createStubInstance(Queue) );
        return new EmailJob( sinon.createStubInstance(Queue, {}) );
      })
      .to.throw(/process/i);

      expect(() => new EmailJob(sinon.createStubInstance( Queue ), function() {}))
      .to.not.throw(Error);
    })
  );

  describe('#create', function() {
    let job   = null;
    let email = null;

    let meta = {
      meta: {
        from:    'from@example.com',
        to:      'to@example.com',
        subject: 'subject'
      }
    };
    let templateName = 'templateName';
    let templateData = { data: 'data' };

    let stub  = sinon.createStubInstance( Queue );
    // bad, stub way too many APIs
    stub.create = () => ({ save(cb) { return cb(); } });

    let spy = sinon.spy(stub, 'create');

    beforeEach(function() {
      // do not care 'processFn' for now
      job = new EmailJob(stub, function() {});

      email = new Email(meta);
      email.templateName(templateName);
      return email.templateData(templateData);
    });

    it('should provide the queue with the correct data format', () =>
      job.create(email, function() {
        let argsList = stub.create.getCall(0).args;
        expect( argsList[0] ).to.equal(JOB_TYPE);

        let queueData = argsList[1];

        expect( queueData.mailOpts ).to.include(meta.meta);
        expect( queueData.templateName ).to.equal(templateName);
        expect( queueData.templateData ).to.equal(templateData);
      })
    );
  });
});
