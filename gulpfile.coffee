# consider 'gulp-load-plugins' when the deps getting more
argv        = require('yargs').argv
del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
nodemon     = require 'gulp-nodemon'
ts          = require 'gulp-typescript'

# 'libsass' version, http://sass-compatibility.github.io/
sass         = require 'gulp-sass'
sourcemaps   = require 'gulp-sourcemaps'
autoprefixer = require 'gulp-autoprefixer'

gulpif      = require 'gulp-if'
browserSync = require 'browser-sync'

tsSource = ['app/**/*.ts', 'typings/**/*.ts']
# for incremental build
tsProject = ts.createProject
  declarationFiles:  true
  noExternalResolve: true
  target: 'ES5'
  module: 'commonjs'

gulp.task 'default', ['clean', 'browser-sync'], ->
  # let 'watch' to be the default for now
  gulp.watch tsSource, ['typescript']
  gulp.watch 'public/scss/**/*.scss', ['scss']

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

gulp.task 'typescript', ->
  tsResult = gulp.src tsSource
              .pipe ts(tsProject)

  eventStream.merge(
    # comment out for now for we don't have our own '.d.ts' files
    #tsResult.dts.pipe gulp.dest('node_modules/definitions'),
    tsResult.js.pipe gulp.dest('node_modules/app')
  )

# intentionally not use `['typescript']` as deps to avoid unnecessary recompilation
gulp.task 'typescript-test', ->
  tsResult = gulp.src 'test/unit/**/*.ts'
              .pipe ts(tsProject)

  # not necessary to generating any .d.ts for test cases
  eventStream.merge tsResult.js.pipe gulp.dest 'build/test/unit'

gulp.task 'nodemon', ['typescript', 'scss'], ->
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

