import express = require('express');

/*
 * GET index page
 */

export function index(req: any, res: any){
    res.render('index', {title: 'Page Title', testArray: ["1", "2"]});
}

/*
 * GET login page
 */

export function login(req: any, res: any){
    res.render('login', {title: 'Login Page', testArray: ["1", "3"]});
}

/*
 * GET users listing page
 */

export function users(req: express.Request, res: express.Response){
    res.render('users', {title: 'User Page'});
}

export function postLogin(req: any, res: any) {
    console.log(res);
}
