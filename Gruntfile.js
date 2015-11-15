module.exports = function (grunt) {

    grunt.initConfig({

        // *************************************************************************************
        //      CONFIG OPTIONS
        // *************************************************************************************

        pkg: grunt.file.readJSON('package.json'),

        banner :  '/*\n   <%= pkg.name %> <%= pkg.version %>\n   <%= pkg.homepage %>\n   <%= pkg.copyright %>\n*/\n',

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
                options: {
                    banner: '<%= banner %>'
                },
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
    grunt.registerTask('header', '', function(arg1) {
        var pkg=grunt.file.readJSON('package.json');
        console.log(
            (new Date()).toString() + '\n' + 
            '     _                   _                      _      __ _ _ _\n'+
            ' ___| |_ _ __ _   _  ___| |_ _   _ _ __ ___  __| |    / _(_) | |_ ___ _ __\n'+
            '/ __| __| \'__| | | |/ __| __| | | | \'__/ _ \\/ _` |___| |_| | | __/ _ \\ \'__|\n'+
            '\\__ \\ |_| |  | |_| | (__| |_| |_| | | |  __/ (_| |___|  _| | | ||  __/ |\n'+
            '|___/\\__|_|   \\__,_|\\___|\\__|\\__,_|_|  \\___|\\__,_|   |_| |_|_|\\__\\___|_|\n'+
            arg1 + ' '+ pkg.version
         );
    });

    // *************************************************************************************
    //      BUILD TASKS : dev prod
    // *************************************************************************************
    // Default task(s).
    grunt.registerTask('default', ['prod']);

    // Dev only task(s).
    grunt.registerTask('dev', ['header:dev', 'less:dev']);

    // Prod only task(s).
    grunt.registerTask('prod', ['header:prod', 'jshint', 'less', 'uglify']);

};

