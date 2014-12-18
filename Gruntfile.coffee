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
        src: ['**/*', '!node_modules/**', '!build/**','!bower_components/**', '!public/vendor']
        dest: 'build/'

    ts:
      default:
        options:
          module: "commonjs"
        src: ["./build/**/*.ts", "!node_modules/**",'!bower_components/**', '!public/vendor']

    browserify:
      client:
        src: ["build/client/main.js" ]
        dest: 'build/public/javascript/bundle.js'

    watch:
      client:
        files:['client/**']
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

  grunt.registerTask "default", ["clean","copy", "ts", "browserify"]
  grunt.registerTask "w",['default',"watch"]
  return
