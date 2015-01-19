# consider 'gulp-load-plugins' when the deps getting more
del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
nodemon     = require 'gulp-nodemon'
ts          = require 'gulp-typescript'

# til 'libsassc' is feature-compatible with 'ruby-sass'
# then we may swithc to 'gulp-sass'
sass        = require 'gulp-ruby-sass'

# let 'watch' to be the default for now
gulp.task 'default', ['clean', 'scss', 'typescript', 'nodemon'], ->
  console.log 'done'

tsSource = 'app/**/*.ts'
# for incremental build
tsProject = ts.createProject
  declarationFiles:  true,
  noExternalResolve: false

gulp.task 'clean', ->
  del(['node_modules/app', 'build'])

gulp.task 'scss', ->
  gulp.src 'public/scss/main.scss'
    .pipe sass { sourcemapPath: '../scss' }
    .on 'error', (err) -> console.log err.message
    .pipe gulp.dest 'public/stylesheets'

gulp.task 'typescript', ->
  tsResult = gulp.src tsSource
              .pipe ts tsProject

  eventStream.merge(
    # comment out for now for we don't have our own '.d.ts' files
    #tsResult.dts.pipe gulp.dest('node_modules/definitions'),
    tsResult.js.pipe gulp.dest('node_modules/app')
  )

# intentinally not use `['typescript']` as deps to avoid unnecessary recompilation
gulp.task 'typescript-test', ->
  tsResult = gulp.src 'test/unit/**/*.ts'
              .pipe ts tsProject

  # not necessary to generating any .d.ts for test cases
  eventStream.merge tsResult.js.pipe gulp.dest 'build/test/unit'

gulp.task 'nodemon', ['typescript'], ->
  nodemon
    script: 'bin/www'
    # TODO investigate why this is not picked up by nodemon
    #ext: 'js json'
  .on 'restart', ->
    console.log 'nodemon restarted!'

  gulp.watch(tsSource, ['typescript'])
  gulp.watch('public/scss/**/*.scss', ['scss'])
  return


