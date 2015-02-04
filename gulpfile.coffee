# consider 'gulp-load-plugins' when the deps getting more
argv        = require('yargs').argv
del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
nodemon     = require 'gulp-nodemon'
ts          = require 'gulp-typescript'
to5         = require 'gulp-6to5'

# 'libsass' version, http://sass-compatibility.github.io/
sass         = require 'gulp-sass'
sourcemaps   = require 'gulp-sourcemaps'
autoprefixer = require 'gulp-autoprefixer'

concat      = require 'gulp-concat'
gulpif      = require 'gulp-if'
browserSync = require 'browser-sync'
extend      = require 'gulp-extend'

# please confirm client folder negation is needed here
tsSource = ['app/**/*.ts', 'typings/**/*.ts', '!app/client/**/*.ts']
# for incremental build
tsProject = ts.createProject
  declarationFiles:  true
  noExternalResolve: true
  target: 'ES5'
  module: 'commonjs'

# gulp.task 'default', ['clean', 'browser-sync', 'locale'], ->
gulp.task 'default', ['clean', 'nodemon', 'locale'], ->
  # let 'watch' to be the default for now
  # gulp.watch 'app/**/*.js', ['6to5']
  gulp.watch tsSource, ['ts']
  gulp.watch 'public/scss/**/*.scss', ['scss']
  gulp.watch 'locales/client/en/*.json', ['locale']
  gulp.watch 'app/client/**/*.ts', ['ts-angularjs']

  console.log 'done'
  return

gulp.task 'clean', ->
  del(['node_modules/app', 'build'])

gulp.task 'scss', ->
  gulp.src 'public/scss/main.scss'
    .pipe sourcemaps.init()
    .pipe sass()
    .pipe autoprefixer( browsers: ['last 2 versions'] )
    .pipe sourcemaps.write '.'
    .pipe gulp.dest 'public/stylesheets'
    .pipe gulpif(browserSync.active, browserSync.reload {stream: true})

gulp.task 'ts', ->
  tsResult = gulp.src tsSource
              .pipe ts(tsProject)

  eventStream.merge(
    # comment out for now for we don't have our own '.d.ts' files
    #tsResult.dts.pipe gulp.dest('node_modules/definitions'),
    tsResult.js.pipe gulp.dest('node_modules/app')
  )

gulp.task '6to5', ->
  to5Result = gulp.src 'app/**/*.js'
                .pipe sourcemaps.init()
                .pipe to5()
                .pipe sourcemaps.write('.')
                .pipe gulp.dest('node_modules/app')

# intentionally not use `['ts']` as deps to avoid unnecessary recompilation
gulp.task 'ts-test', ->
  tsResult = gulp.src 'test/unit/**/*.ts'
              .pipe ts(tsProject)

  # not necessary to generating any .d.ts for test cases
  eventStream.merge tsResult.js.pipe gulp.dest 'build/test/unit'

gulp.task 'ts-angularjs', ->
  tsResult = gulp.src 'app/client/angularjs/**/*.ts'
              .pipe ts { sortOutput: true }

  return tsResult.js
              .pipe concat('application.js')
              .pipe gulp.dest 'public/javascript'

gulp.task 'nodemon', ['ts', 'scss', 'ts-angularjs'], ->
# gulp.task 'nodemon', ['6to5', 'scss', 'ts-angularjs'], ->
  nodemon
    script: 'bin/www'
    # TODO investigate why this is not picked up by nodemon
    #ext: 'js json'
    nodeArgs: [ if argv.debug then '--debug' else '' ]
  .on 'restart', ->
    console.log 'nodemon restarted!'
    return
  return

gulp.task 'browser-sync', ['nodemon'], ->
  browserSync
    # host & port for your express
    proxy: 'localhost:3000'
    startPath: '/login'
    port: 3333
  return

gulp.task 'locale', ->
  gulp.src 'locales/client/en/*.json'
    .pipe extend('en.json')
    .pipe gulp.dest('public/locales')
