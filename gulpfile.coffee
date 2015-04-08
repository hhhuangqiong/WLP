# consider 'gulp-load-plugins' when the deps getting more

console.time 'Loading plugins'

{argv}      = require 'yargs'
buffer      = require 'vinyl-buffer'
del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
gutil       = require 'gulp-util'
nodemon     = require 'gulp-nodemon'
source      = require 'vinyl-source-stream'
babel       = require 'gulp-babel'

browserify = require 'browserify'
ngAnnotate = require 'browserify-ngannotate'
babelify   = require 'babelify'

# 'libsass' version, http://sass-compatibility.github.io/
sass         = require 'gulp-sass'
sourcemaps   = require 'gulp-sourcemaps'
autoprefixer = require 'gulp-autoprefixer'

concat      = require 'gulp-concat'
extend      = require 'gulp-extend'

istanbul = require 'gulp-istanbul'
mocha    = require 'gulp-mocha'

console.timeEnd 'Loading plugins'

# reduce startup loading time
browserSync = null

src =
  allJS:    'app/**/*.js'
  clientJS: 'app/client/**/*.js'

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
# let 'watch' be the default for now
gulp.task 'default', ['clean', 'locale', 'nodemon', 'watch'], ->
  console.log 'done \uD83D\uDE80'
  return

gulp.task 'watch', ['watch:js'], ->
  gulp.watch 'public/scss/**/*.scss', ['scss']
  gulp.watch 'locales/client/en/*.json', ['locale']
  return

gulp.task 'watch:js', ['babel'], ->
  gulp.watch [src.allJS, "!#{src.clientJS}"], ['babel']
  gulp.watch src.clientJS, ['babel-ng']
  return

gulp.task 'clean', ->
  del(['node_modules/app', 'build/**/*'])

gulp.task 'scss', ->
  gulp.src 'public/scss/main.scss'
    .pipe sourcemaps.init()
    .pipe sass()
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

gulp.task 'babel', ->
  b = if /^watch/.test argv._[0] then _continueOnError babel else babel()

  gulp.src src.allJS
    .pipe b
    .pipe sourcemaps.init()
    .pipe sourcemaps.write '.'
    .pipe gulp.dest dest.node

gulp.task 'babel-ng', ->
  browserify { entries: './app/client/WhiteLabel.js', debug: true }
    .transform(babelify)
    .transform(ngAnnotate)
    .bundle()
    .pipe source('application.js')
    .pipe buffer()
    .pipe gulp.dest('public/javascript')

gulp.task 'nodemon', ['scss', 'babel', 'babel-ng'], ->
  nodemon
    script: 'bin/www'
    # TODO investigate why this is not picked up by nodemon
    #ext: 'js json'
    nodeArgs: [ if argv.debug then '--debug' else '' ]
  .on 'restart', ->
    console.log 'nodemon restarted!'
    return
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

gulp.task 'locale', ->
  gulp.src 'locales/client/en/*.json'
    .pipe extend('en.json')
    .pipe gulp.dest('public/locales')
