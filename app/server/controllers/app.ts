import express = require('express');

class App {

  constructor() {
  }

  index = (req: any, res: any, next: Function) => {
    res.render('layout/admin-layout', {})
  }
}

export = App;
