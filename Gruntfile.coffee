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
        src: ['**/*', '!node_modules/**', '!build/**','!bower_components/**', '!public/vendor/**']
        dest: 'build/'

    ts:
      "transforms-only":
        options:
          compile: false
        src:["build/**"]

      default:
        options:
          module: "commonjs"
        src: ["build/**/*.ts"]

    browserify:
      client:
        src: ["build/app/client/main.js" ]
        dest: 'public/javascript/bundle.js'

    watch:
      client:
        files:['app/client/**']
        tasks:['copy','browserify']

      scripts:
        files:['**/*.ts', '!node_modules/**', '!build/**','!bower_components/**', '!public/vendor', 'views']
        tasks:["copy","ts"]
        options:
          spawn:false

      copylist:
        files:['views/**', 'locales/**']
        tasks:['copy']

  grunt.event.on "watch", (action, filepath, target) ->
    grunt.config 'copy.main.src', filepath
    grunt.log.writeln target + ": " + filepath + " has " + action
    return

#  grunt.registerTask "default", ["clean","copy", "ts", "browserify"]
  grunt.registerTask "default", ["clean","copy","ts:transforms-only","ts:default", "browserify"]
  grunt.registerTask "w",['default',"watch"]
  return
