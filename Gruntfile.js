module.exports = function (grunt) {

    grunt.initConfig({

        // *************************************************************************************
        //      CONFIG OPTIONS
        // *************************************************************************************

        pkg: grunt.file.readJSON('package.json'),
        banner :  '/*\n   <%= pkg.name %> <%= pkg.version %>\n   <%= pkg.copyright %>\n   <%= pkg.homepage %>\n*/\n',

        // *************************************************************************************
        //      JSHINT options
        // *************************************************************************************
        jshint: {
            all: [
                'Gruntfile.js',
                'package.json',
                'js/structured-filter.js'
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
                'js/structured-filter.min.js': ['js/structured-filter.js']
                }
            }
        },

        // *************************************************************************************
        //      LESS
        // *************************************************************************************
        less: {
            dev: {
                files: {
                    "css/structured-filter.css": "less/structured-filter.less"
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
    grunt.registerTask('dev', ['less:dev']);

    // Prod only task(s).
    grunt.registerTask('prod', ['less', 'jshint', 'uglify']);

};

