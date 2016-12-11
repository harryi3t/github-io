'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    watch: {
      scripts: {
        files: [
          'src/*.js',
        ],
        tasks: ['babel'],
        options: {
          spawn: true,
        },
      }
    },
    babel: {
      dist: {
        files: {
          'dist/Adapter.js': 'src/Adapter.js',
          'dist/logger.js': 'src/logger.js',
          'dist/script.js': 'src/script.js'
        }
      }
    },
    clean: ['dist/*']
  });
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('build', ['clean', 'babel']);
  grunt.registerTask('default', ['build']);
};
