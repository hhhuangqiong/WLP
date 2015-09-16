# consider 'gulp-load-plugins' when the deps getting more

console.time 'Loading plugins'

# allow using gulp to run mocha test using es6's way
require 'babel/register'

autoprefixer     = require 'gulp-autoprefixer'
babel            = require 'gulp-babel'
del              = require 'del'
extend           = require 'gulp-extend'
gulp             = require 'gulp'
gutil            = require 'gulp-util'
istanbul         = require 'gulp-istanbul'
mocha            = require 'gulp-mocha'
nodemon          = require 'gulp-nodemon'
# 'libsass' version, http://sass-compatibility.github.io/
sass             = require 'gulp-sass'
bless            = require 'gulp-bless'
source           = require 'vinyl-source-stream'
sourcemaps       = require 'gulp-sourcemaps'
webpack          = require 'webpack'
WebpackDevServer = require 'webpack-dev-server'
spriteSmith      = require 'gulp.spritesmith'
merge            = require 'merge-stream'

{argv}           = require 'yargs'
{exec}           = require 'child_process'

console.timeEnd 'Loading plugins'

env = process.env.NODE_ENV || 'development'

if env == "development" then webpackConfig = require './webpack.config' else webpackConfig = require './webpack.production.config'

# reduce startup loading time
browserSync = null

src =
  allJS: 'app/**/*.js'
  scss:  'public/scss/main.scss'

dest =
  build: './build'
  app:   './node_modules/app'
  css:   'public/stylesheets'
  image: 'public/images'

gulp.task 'test', (cb) ->
  gulp.src [ "#{dest.app}/**/*.js" ]
    .pipe istanbul()
    .pipe istanbul.hookRequire()
    .on 'finish', ->
      gulp.src ['test/unit/**/*.coffee', 'test/unit/**/*.js', 'test/scss/**/*.js']
        .pipe mocha()
        .pipe istanbul.writeReports({ dir: "#{dest.build}/coverage" })
        .on 'end', cb
  return

gulp.task 'default', ['clean', 'webpack-dev-server', 'nodemon', 'watch'], ->
  gutil.log '[default] done \uD83D\uDE80'
  return

gulp.task 'sprite', ->
  spriteData = gulp.src("#{dest.image}/flag_256/*png")
    .pipe spriteSmith({
      imgName: '../images/map-sprite.png'
      cssName: 'map-sprite.css'
      padding: 5
      cssOpts:
        functions: false,
        cssSelector: (item) ->
          '.flag--' + item.name
    })

  imgStream = spriteData.img
    .pipe gulp.dest(dest.image)

  cssStream = spriteData.css
    .pipe gulp.dest(dest.css)

  merge imgStream, cssStream

gulp.task 'watch', ->
  gulp.watch 'public/scss/**/*.scss', ['scss']
  #gulp.watch 'locales/client/en/*.json', ['locale']
  return

gulp.task 'watch:js', ['babel'], ->
  gulp.watch src.allJS, ['babel']
  return

gulp.task 'clean', ->
  del([ "#{dest.app}", "#{dest.build}/**/*" ])

autoprefixerOpts =
  browsers: ['last 2 versions']

gulp.task 'scss:production', ->
  gulp.src src.scss
    .pipe sass({ outputStyle: 'compressed' })
    .pipe autoprefixer(autoprefixerOpts)
    .pipe bless()
    .pipe gulp.dest(dest.css)

gulp.task 'scss', ->
  gulp.src src.scss
    .pipe sourcemaps.init()
    .pipe sass(
      onError: (e) ->
        gutil.log e
    )
    .pipe autoprefixer(autoprefixerOpts)
    .pipe sourcemaps.write '.'
    .pipe gulp.dest(dest.css)
    .pipe (if (browserSync? && browserSync.active) then browserSync.reload {stream: true} else gutil.noop())

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
    .pipe gulp.dest dest.app

gulp.task 'webpack', (cb)->
  webpack webpackConfig, (err, stats) ->
    throw new gutil.PluginError("webpack", err) if err
    # https://webpack.github.io/docs/node.js-api.html#stats
    if argv.debug
      gutil.log "[webpack]", stats.toString { timings: true, colors: true }
    else
      gutil.log "[webpack] Finished \ud83d\udc4d"
    cb()
  return

  gulp.src('./app/client.js')
    .pipe webpack(webpackConfig)
    .pipe gulp.dest('public/javascript/')

gulp.task "webpack-dev-server", ['scss', 'webpack'], (callback) ->
  return callback() if env != 'development'

  hotLoadPort = webpackConfig.custom.hotLoadPort
  devServer = new WebpackDevServer(webpack(webpackConfig),
    # 'redirect loop' occurs if using 'http://<host>:<hotLoadPort>'
    contentBase: webpackConfig.output.path
    hot: true
    noInfo: true
    watchOptions:
      aggregateTimeout: 100
    headers:
      'Access-Control-Allow-Origin': '*'
  )
  devServer.listen hotLoadPort, "0.0.0.0", (err) ->
    throw new gutil.PluginError("webpack-dev-server", err) if err
    gutil.log "[webpack-dev-server]", "#{webpackConfig.output.publicPath}"
    callback()

  return

gulp.task 'nodemon', ->
  nodemon
    script: 'bin/www'
    # prefer to keep configuration in "nodemon.json"
    nodeArgs: [ if argv.debug then '--debug' else '' ]
  .on 'restart', ->
    gutil.log 'nodemon restarted! \uD83D\uDE80'
    return
  isNodemonRunning = true

# not trigger 'browser-sync'; `gulp browser-sync` separately if needed
gulp.task 'browser-sync', ->
  browserSync = require 'browser-sync'
  browserSync
    # host & port for Express app
    proxy: 'localhost:3000'
    startPath: '/login'
    port: 3333
  return

# probably not needed for React component
gulp.task 'locale', ->
  gulp.src 'locales/client/en/*.json'
    .pipe extend('en.json')
    .pipe gulp.dest('public/locales')
