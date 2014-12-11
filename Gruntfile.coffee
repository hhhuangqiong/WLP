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
        src: ['**/*', '!node_modules/**', '!build/**']
        dest: 'build/'

    ts:
      default:
        options:
          module: "commonjs"
        src: ["./build/**/*.ts", "!node_modules/**"]
    
    watch:
      scripts:
        files:['**/*.ts', '!node_modules/**', '!build/**']
        tasks:["copy","ts"]
        options:
          spawn:false

  grunt.event.on "watch", (action, filepath, target) ->
    grunt.config('copy.main.src',filepath);
    grunt.log.writeln target + ": " + filepath + " has " + action
    return
      

  grunt.registerTask "default", ["clean","copy", "ts"]
  grunt.registerTask "w",['default',"watch"]
  return