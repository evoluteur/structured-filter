module.exports = function (grunt) {

    grunt.initConfig({

        // *************************************************************************************
        //      CONFIG OPTIONS
        // *************************************************************************************

        pkg: grunt.file.readJSON('package.json'),
        banner :  '/*\n   <%= pkg.name %> <%= pkg.version %>\n   <%= pkg.copyright %>\n*/\n',

        // *************************************************************************************
        //      JSHINT options
        // *************************************************************************************
        jshint: {
            all: [
                'Gruntfile.js',
                'package.json',
                'js/evol.advancedSearch.js'
            ]
        },

        // *************************************************************************************
        //      UGLIFY options
        // *************************************************************************************
        uglify: {
            options: {
                banner: '<%= banner %>',
                mangle: true
            },
            js: {
                files: { 
                'js/evol.advancedSearch.min.js': ['js/evol.advancedSearch.js']
                }
            }
        },

        // *************************************************************************************
        //      LESS
        // *************************************************************************************
        less: {
            dev: {
                files: {
                    "css/evol.advancedSearch.css": "less/evol.advancedSearch.less"
                }
            }
        }

    });

// Load the plugin that provides the tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');

// Custom tasks

    // *************************************************************************************
    //      BUILD TASKS : dev prod
    // *************************************************************************************
    // Default task(s).
    grunt.registerTask('default', ['dev']);

    // Dev only task(s).
    grunt.registerTask('dev', ['less:dev', 'jshint']);

    // Prod only task(s).
    grunt.registerTask('prod', ['less', 'jshint', 'uglify']);

};

