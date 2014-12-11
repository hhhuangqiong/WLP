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

  grunt.registerTask "default", ["clean", "copy", "ts"]
  return

