# consider 'gulp-load-plugins' when the deps getting more

console.time 'Loading plugins'

autoprefixer  = require 'gulp-autoprefixer'
babel         = require 'gulp-babel'
del           = require 'del'
extend        = require 'gulp-extend'
gulp          = require 'gulp'
gutil         = require 'gulp-util'
istanbul      = require 'gulp-istanbul'
mocha         = require 'gulp-mocha'
nodemon       = require 'gulp-nodemon'
# 'libsass' version, http://sass-compatibility.github.io/
sass          = require 'gulp-sass'
source        = require 'vinyl-source-stream'
sourcemaps    = require 'gulp-sourcemaps'
webpack       = require 'webpack'
webpackConfig = require './webpack.config'
{argv}        = require 'yargs'
{exec}        = require 'child_process'

console.timeEnd 'Loading plugins'

# reduce startup loading time
browserSync = null
isNodemonRunning = false

src =
  allJS:    'app/**/*.js'

dest =
  build: './build'
  app: "./node_modules/app"

gulp.task 'test', (cb) ->
  gulp.src [ "#{dest.app}/**/*.js" ]
    .pipe istanbul()
    .pipe istanbul.hookRequire()
    .on 'finish', ->
      gulp.src ['test/unit/**/*.coffee']
        .pipe mocha()
        .pipe istanbul.writeReports({ dir:  "#{dest.build}/coverage" })
        .on 'end', cb
  return

# not trigger 'browser-sync'; `gulp browser-sync` separately if needed
gulp.task 'default', ['clean', 'locale', 'nodemon', 'watch'], ->
  console.log 'done \uD83D\uDE80'
  return

gulp.task 'watch', ['watch:js'], ->
  gulp.watch 'public/scss/**/*.scss', ['scss']
  gulp.watch 'locales/client/en/*.json', ['locale']
  return

gulp.task 'watch:js', ['webpack'], ->
  gulp.watch src.allJS, ['webpack']
  return

gulp.task 'clean', ->
  del([ "#{dest.app}", "#{dest.build}/**/*" ])

gulp.task 'scss', ->
  gulp.src 'public/scss/main.scss'
    .pipe sourcemaps.init()
    .pipe sass(
      onError: (e) ->
        gutil.log e
    )
    .pipe autoprefixer( browsers: ['last 2 versions'] )
    .pipe sourcemaps.write '.'
    .pipe gulp.dest 'public/stylesheets'
    .pipe (if (browserSync? && browserSync.active) then browserSync.reload {stream: true} else gutil.noop())

# https://github.com/gulpjs/gulp/issues/71#issuecomment-41512070
_continueOnError = (fn) ->
  _fn = fn()
  _fn.on 'error', (e) ->
    gutil.log e
    _fn.end()
    return
  _fn

b = if /^watch/.test argv._[0] then _continueOnError babel else babel()

gulp.task 'babel', ->
  gulp.src src.allJS
    .pipe b
    .pipe sourcemaps.init()
    .pipe sourcemaps.write '.'
    .pipe gulp.dest dest.app

gulp.task 'webpack', (cb)->
  webpack webpackConfig, (err, stats) ->
    throw new gutil.PluginError("webpack", err) if err
    gutil.log "[webpack]", stats.toString()
    cb()
  return

  gulp.src('./app/client.js')
  .pipe(webpack(webpackConfig))
  .pipe gulp.dest('public/javascript/')

gulp.task 'nodemon', ['scss', 'webpack'], ->
  nodemon
    script: 'bin/www'
    # prefer to keep configuration in "nodemon.json"
    nodeArgs: [ if argv.debug then '--debug' else '' ]
  .on 'restart', ->
    console.log 'nodemon restarted!'
    return
  isNodemonRunning = true
  return

# intentionally not using `['nodemon']` as deps
gulp.task 'browser-sync', ->
  browserSync = require 'browser-sync'
  browserSync
    # host & port for Express app
    proxy: 'localhost:3000'
    startPath: '/login'
    port: 3333
  return

# probably not needed in the future
gulp.task 'locale', ->
  gulp.src 'locales/client/en/*.json'
    .pipe extend('en.json')
    .pipe gulp.dest('public/locales')
