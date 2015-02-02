# consider 'gulp-load-plugins' when the deps getting more

console.time 'Loading plugins';

argv        = require('yargs').argv
buffer      = require 'vinyl-buffer'
del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
nodemon     = require 'gulp-nodemon'
source      = require 'vinyl-source-stream'
to5         = require 'gulp-6to5'

# 1 of the reasons behind using 'yuidoc', https://github.com/jsBoot/gulp-jsdoc#big-fat-warning
yuidoc       = require 'gulp-yuidoc'

browserify  = require 'browserify';
ngAnnotate  = require 'browserify-ngannotate'
to5ify      = require '6to5ify';

# 'libsass' version, http://sass-compatibility.github.io/
sass         = require 'gulp-sass'
sourcemaps   = require 'gulp-sourcemaps'
autoprefixer = require 'gulp-autoprefixer'

concat      = require 'gulp-concat'
gulpif      = require 'gulp-if'
browserSync = require 'browser-sync'
extend      = require 'gulp-extend'

console.timeEnd 'Loading plugins';

src =
  allJS:  'app/**/*.js'
  clientJS:  'app/client/**/*.js'

dest =
  node: 'node_modules/app'

# not trigger 'browser-sync'; `gulp browser-sync` separately if needed
gulp.task 'default', ['clean', 'locale', 'nodemon'], ->
  # let 'watch' to be the default for now

  gulp.watch [src.allJS, "!#{src.clientJS}"], ['6to5']
  gulp.watch src.clientJS, ['6to5-ng']
  gulp.watch 'public/scss/**/*.scss', ['scss']
  gulp.watch 'locales/client/en/*.json', ['locale']

  console.log 'done'
  return

gulp.task 'clean', ->
  del(['node_modules/app', 'build/**/*'])

# name as jsdoc on purpose
gulp.task 'jsdoc', ['6to5'], ->
  gulp.src "#{dest.node}/**/*.js"
    .pipe yuidoc()
    .pipe gulp.dest 'build/docs'

gulp.task 'scss', ->
  gulp.src 'public/scss/main.scss'
    .pipe sourcemaps.init()
    .pipe sass()
    .pipe autoprefixer( browsers: ['last 2 versions'] )
    .pipe sourcemaps.write '.'
    .pipe gulp.dest 'public/stylesheets'
    .pipe gulpif(browserSync.active, browserSync.reload {stream: true})

gulp.task '6to5', ->
  gulp.src src.allJS
    .pipe to5()
    .pipe sourcemaps.init()
    .pipe sourcemaps.write '.'
    .pipe gulp.dest dest.node

gulp.task '6to5-ng', ->
  browserify({ entries: './app/client/WhiteLabel.js', debug: true })
    .transform(to5ify)
    .transform(ngAnnotate)
    .bundle()
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public/javascript'));

gulp.task 'nodemon', ['scss', '6to5', '6to5-ng'], ->
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
  browserSync
    # host & port for your express app
    proxy: 'localhost:3000'
    startPath: '/login'
    port: 3333
  return

gulp.task 'locale', ->
  gulp.src 'locales/client/en/*.json'
    .pipe extend('en.json')
    .pipe gulp.dest('public/locales')
