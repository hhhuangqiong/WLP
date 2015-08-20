import sinon from 'sinon';
import superagent from 'superagent';
import {expect} from 'chai';

// test target
import * as saUtil from 'utils/superagent';

describe('Superagent helper function', function() {
  let url = 'http://example.com/api/somewhere';
  let agent;

  it('show support different HTTP methods', function() {
    agent = saUtil.getJsonSetup(url);
    expect(agent.url).to.equal(url);
    expect(agent.method).to.match(/get/i);

    agent = saUtil.postJsonSetup(url);
    expect(agent.url).to.equal(url);
    expect(agent.method).to.match(/post/i);
  });

  it('should support fn as value in "headers"', function() {
    let fn = function(){ return 'random-token'; }
    let spy = sinon.spy(fn);

    let agent = saUtil.getJsonSetup(url, { headers: { 'Authorization': spy } });
    expect(spy.calledOnce).to.be.true;
  });

});
