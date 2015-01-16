del         = require 'del'
eventStream = require 'event-stream'
gulp        = require 'gulp'
nodemon     = require 'gulp-nodemon'
ts          = require 'gulp-typescript'

# let 'watch' to be the default for now
gulp.task 'default', ['clean', 'watch'], ->
  console.log 'done'

tsSource = 'app/**/*.ts'
# for incremental build
tsProject = ts.createProject
  declarationFiles:  true,
  noExternalResolve: false

gulp.task 'clean', ->
  del(['node_modules/app'])

gulp.task 'scripts', ->
  tsResult = gulp.src tsSource
              .pipe ts tsProject

  eventStream.merge(
    # comment out for now for we don't have our own '.d.ts'
    #tsResult.dts.pipe gulp.dest('node_modules/definitions'),
    tsResult.js.pipe gulp.dest('node_modules/app')
  )

gulp.task 'nodemon', ['scripts'], ->
  nodemon
    script: 'bin/www'
    # TODO investigate why this is not picked up by nodemon
    #ext: 'js json'
  .on 'restart', ->
    console.log 'nodemon restarted!'

gulp.task 'watch', ->
  gulp.watch(tsSource, ['scripts'])
  gulp.run('nodemon')

