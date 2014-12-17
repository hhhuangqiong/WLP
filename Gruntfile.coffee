module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.initConfig
    clean:
      build:
        src: ['build/']

    copy:
      main:
        # [Kareem] "**" in the negate case is required!
        src: ['**/*', '!node_modules/**', '!build/**','!bower_components/**']
        dest: 'build/'

    ts:
      default:
        options:
          module: "commonjs"
        src: ["./build/**/*.ts", "!node_modules/**",'!bower_components/**']

    browserify:
      client:
        src: ["build/client/main.js" ]
        dest: 'build/public/javascript/bundle.js'

    watch:
      client:
        files:['client/**']
        tasks:['copy','browserify']

      scripts:
        files:['**/*.ts', '!node_modules/**', '!build/**','!bower_components/**']
        tasks:["copy","ts"]
        options:
          spawn:false

  grunt.event.on "watch", (action, filepath, target) ->
    grunt.config 'copy.main.src', filepath
    grunt.log.writeln target + ": " + filepath + " has " + action
    return

  grunt.registerTask "default", ["clean","copy", "ts", "browserify"]
  grunt.registerTask "w",['default',"watch"]
  return
