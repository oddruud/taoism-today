module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            debug: {
              files: [{
                        expand: true,
                        src: ['**/*', '!bin-debug/', '!bin-release/'],
                        dest: 'bin-debug/'
                    }
                ]
            },
            release: {
                files: [{
                        expand: true,
                        src: ['**/*', '!bin-debug/', '!bin-release/'],
                        dest: 'bin-release/'
                    }
                ]
            }
        },
        remove: {
            options: {
                trace: true
            },
            clean_release: {
                dirList: ['./bin-release']
            },
            clean_debug: {
                dirList: ['./bin-debug']
            }
        },
        concat: {
            options: {
                separator: ' '
            },
            css: {
                src: ['style/**/*.css', '!style/style.css'],
                dest: 'style/style.css'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'libs/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'libs/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                force: true,
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        },
        rsync: {
            options: {
                args: ["--verbose"],
                exclude: [".git*", "*.scss", "node_modules", "assets", "deprecated"],
                recursive: true
            },
            stage_debug: {
                options: {
                    src: "./bin-debug/*",
                    dest: "/home/rucrede/taoism_today/public_html/staging",
                    host: "root@vps",
                    delete: false // Careful this option could cause data loss, read the docs!
                }
            },
            stage: {
                options: {
                    src: "./bin-release/*",
                    dest: "/home/rucrede/taoism_today/public_html/staging",
                    host: "root@vps",
                    delete: false // Careful this option could cause data loss, read the docs!
                }
            },
            deploy: {
                options: {
                    src: "./bin-release/*",
                    dest: "/home/rucrede/taoism_today/public_html",
                    host: "root@vps",
                    delete: false // Careful this option could cause data loss, read the docs!
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: function() {
                        var d = new Date();
                        var date_underlined = d.toString().replace(/\s/g, "_");
                        return "builds/<%= pkg.name %>_" + date_underlined + ".zip";
                    }
                },
                files: [{
                    expand: false,
                    cwd: 'release',
                    src: ['**/*'],
                    dest: '/',
                    ext: '.zip'
                }]
            }
        },
        imagemin: {
            release: {
                options: { // Target options
                    optimizationLevel: 7,
                    svgoPlugins: [{
                        removeViewBox: false
                    }]
                }, // Another target
                files: [{
                    expand: true, // Enable dynamic expansion
                    src: ['./bin-release/images/**/*.{png,jpg,gif,svg}'] // Actual patterns to match
                }]
            },
            debug: {
                options: { // Target options
                    optimizationLevel: 7,
                    svgoPlugins: [{
                        removeViewBox: false
                    }]
                }, // Another target
                files: [{
                    expand: true, // Enable dynamic expansion
                    src: ['./bin-debug/images/**/*.{png,jpg,gif,svg}'] // Actual patterns to match
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-rsync");
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-remove');

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('clean-debug', ['remove:clean_debug']);
    grunt.registerTask('build-debug', ['jshint', 'concat', 'uglify', 'newer:copy:debug']);
    grunt.registerTask('clean-release', ['remove:clean_release']);
    grunt.registerTask('build-release', ['jshint', 'concat', 'uglify', 'remove:clean_release', 'newer:copy:release', 'newer:imagemin:release', 'compress']);
    
    grunt.registerTask('stage', ['rsync:stage']);
    grunt.registerTask('stagedebug', ['rsync:stage_debug']);
    grunt.registerTask('deploy', ['rsync:deploy']);

};
