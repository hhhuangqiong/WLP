# M800 White Label Portal

How the project is set up
============

Steps:

```
> npm i -g express-generator
> npm i tsd@next -g
> tsd init

# the following 2 will install .d.ts files under typings/ folder
> tsd install node --save
> tsd install express --save

# rename `app.js` to `app.ts` and add some typescript-specific setting

> npm run tsc

# you should see lots of error but the script can be built (no abort)
# to prove this: 
> npm install && npm run start 
```

Reference
============
* [tsd](https://github.com/DefinitelyTyped/tsd)
* [Express generator](http://expressjs.com/starter/generator.html)
