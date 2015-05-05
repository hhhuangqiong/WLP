# consider 'gulp-load-plugins' when the deps getting more

console.time 'Loading plugins'

autoprefixer = require 'gulp-autoprefixer'
babel        = require 'gulp-babel'
browserify   = require 'browserify'
del          = require 'del'
extend       = require 'gulp-extend'
gulp         = require 'gulp'
gutil        = require 'gulp-util'
istanbul     = require 'gulp-istanbul'
mocha        = require 'gulp-mocha'
nodemon      = require 'gulp-nodemon'
runSequence  = require 'run-sequence'
# 'libsass' version, http://sass-compatibility.github.io/
sass         = require 'gulp-sass'
source       = require 'vinyl-source-stream'
sourcemaps   = require 'gulp-sourcemaps'
{argv}       = require 'yargs'
{exec}       = require 'child_process'

console.timeEnd 'Loading plugins'

# reduce startup loading time
browserSync = null
isNodemonRunning = false

src =
  allJS:    'app/**/*.js'
  clientJS: 'app/client/**/*.js'
  reactJS:  ['app/{actions,components,stores}/**/*.js', 'app/client.js']

dest =
  node: 'node_modules/app'

gulp.task 'test', (cb) ->
  gulp.src [ "#{dest.node}/**/*.js" ]
    .pipe istanbul()
    .pipe istanbul.hookRequire()
    .on 'finish', ->
      gulp.src ['test/unit/**/*.coffee']
        .pipe mocha()
        .pipe istanbul.writeReports({ dir:  './build/coverage' })
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

gulp.task 'watch:js', ['babel'], ->
  # no hints when not running in server mode
  gulp.watch [src.allJS, "!#{src.clientJS}"], ['babel-server']
  gulp.watch src.reactJS, ['babel-react'], ['babel-react-server']
  return

['babel', 'babel-react'].forEach (t) ->
  gulp.task "#{t}-server", (cb) ->
    runSequence(t, 'nodemon-hints', cb)

gulp.task 'nodemon-hints', (cb) ->
  # defer evaluation
  return cb() if !isNodemonRunning
  exec 'touch nodemon.json', (err) ->
    return cb(err) if err
    cb()

gulp.task 'clean', ->
  del(['node_modules/app', 'build/**/*'])

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
    .pipe (if ( browserSync? && browserSync.active ) then browserSync.reload {stream: true} else gutil.noop())

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
    .pipe gulp.dest dest.node

gulp.task 'babel-react', ['babel'], ->
  browserify({
    entries: "./#{dest.node}/client.js",
    extensions: ['.js'],
    debug: true
  })
  .bundle()
  .pipe source('bundle.js')
  .pipe gulp.dest('public/javascript/')

gulp.task 'nodemon', ['scss', 'babel', 'babel-react'], ->
  nodemon
    script: 'bin/www'
    # TODO investigate why this is not picked up by nodemon
    #ext: 'js json'
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
