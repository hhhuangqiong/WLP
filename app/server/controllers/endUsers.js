var express = require('express');

class EndUsers {
  constructor() {

  }

  test(req, res, next) {
    res.json({
      'title': 'testing'
    });
  }
}

export default EndUsers;
