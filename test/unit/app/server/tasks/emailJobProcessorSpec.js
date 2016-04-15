import { expect } from 'chai';
import sinon from 'sinon';
// collaborator
import Mailer from 'app/lib/mailer/templateMailer';
// object under test
import emailJobProcessor from 'app/server/tasks/emailJobProcessor';

describe('Email job processor', function() {
  let mailerStub = sinon.createStubInstance(Mailer);
  let fakeMailer = { send() {} };

  it('should throw Error on invalid argument', function() {
    expect(() => emailJobProcessor())
    .to.throw(Error, /mailer/i);
    expect(() => emailJobProcessor({}))
    .to.throw(Error, /send/i);
    expect(function() {
      emailJobProcessor(mailerStub);
      return emailJobProcessor(fakeMailer);
    })
    .to.not.throw(Error);
  });

  it('should return a function with correct arity', function() {
    let fn = emailJobProcessor(mailerStub);
    expect( fn ).to.be.a('function');
    expect( fn.length ).to.equal(2);
  });

  // not using 'done' with 'it' since it's testing about arguments
  it('should pass the correct arguments to mailer', function() {
    let fn = emailJobProcessor(fakeMailer);
    let method = 'send';
    sinon.spy(fakeMailer, method);
    let job = {
      data: {
        mailOpts: {
          from: 'from@example.com',
          to: 'from@example.com'
        }
      },
      templateName: 'templateName',
      templateData: {
        data: 'data'
      }
    };

    let doneCB = function() {};

    fn(job, doneCB);

    let argsList = fakeMailer[method].getCall(0).args;
    expect( argsList[0] ).to.equal(job.data.mailOpts);
    expect( argsList[1] ).to.equal(job.data.templateName);
    expect( argsList[2] ).to.equal(job.data.templateData);
    // correct?
    expect( argsList[3] ).to.eql(doneCB);
  });
});
